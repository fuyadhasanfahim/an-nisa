import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        category: true,
        fabricType: true,
        sizes: true,
        colors: true,
      },
    });

    const categoriesSet = new Set<string>();
    const fabricTypesSet = new Set<string>();
    const sizesSet = new Set<string>();
    const colorSwatchesMap = new Map<string, { name: string; value: string; hex: string }>();

    // Standard category mapping for display names
    const categoryLabels: Record<string, string> = {
      embroidery: "Embroidery",
      abaya: "Abaya",
      fashion: "Fashion",
      textiles: "Fabrics",
      handmade: "Handmade",
      custom: "Curated Custom",
      accessories: "Accessories",
    };

    products.forEach((p) => {
      if (p.category) {
        categoriesSet.add(p.category.toLowerCase().trim());
      }
      if (p.fabricType) {
        fabricTypesSet.add(p.fabricType.trim());
      }
      if (p.sizes) {
        p.sizes.forEach((s) => {
          const sizeTrimmed = s?.trim();
          if (sizeTrimmed) sizesSet.add(sizeTrimmed);
        });
      }
      if (p.colors) {
        p.colors.forEach((c) => {
          const colorStr = c?.trim();
          if (!colorStr) return;

          let name = colorStr;
          let hex = "#1a1a1a"; // default black if not specified

          if (colorStr.includes("#")) {
            const parts = colorStr.split("#");
            const possibleName = parts[0]?.trim();
            const possibleHex = parts[1]?.trim();
            if (possibleName) name = possibleName;
            if (possibleHex && possibleHex.length >= 3) {
              hex = `#${possibleHex.replace(/^#+/, "")}`;
            }
          } else {
            // Check for standard color names to map to nice hexes
            const lowerName = name.toLowerCase();
            const colorMapping: Record<string, string> = {
              black: "#1a1a1a",
              white: "#ffffff",
              red: "#dc2626",
              pink: "#fcc4c8",
              navy: "#1e3a5f",
              gold: "#d4a853",
              green: "#16a34a",
              maroon: "#7f1d1d",
            };
            if (colorMapping[lowerName]) {
              hex = colorMapping[lowerName]!;
            }
          }

          const valueKey = name.toLowerCase();
          if (!colorSwatchesMap.has(valueKey)) {
            colorSwatchesMap.set(valueKey, {
              name,
              value: colorStr,
              hex,
            });
          }
        });
      }
    });

    // Format categories
    const categories = Array.from(categoriesSet).map((val) => ({
      label: categoryLabels[val] || val.charAt(0).toUpperCase() + val.slice(1),
      value: val,
    }));

    // Format fabric types
    const fabricTypes = Array.from(fabricTypesSet).map((val) => {
      return val.charAt(0).toUpperCase() + val.slice(1);
    });

    // Format sizes
    const sizes = Array.from(sizesSet);

    // Format colors
    const colors = Array.from(colorSwatchesMap.values());

    return NextResponse.json({
      categories,
      fabricTypes,
      sizes,
      colors,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to resolve storefront filters" },
      { status: 500 }
    );
  }
}
