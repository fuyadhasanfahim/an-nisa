"use client";

import { AdminTitle } from "@/components/admin/AdminTitle";
import { ProductForm } from "@/components/admin/product/ProductForm";
import { motion } from "framer-motion";

export default function NewProductPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      className="space-y-6"
    >
      <AdminTitle title="Add Product" subtitle="Create a new product in your catalog" />

      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-black/5">
          <ProductForm />
        </div>
      </div>
    </motion.div>
  );
}

