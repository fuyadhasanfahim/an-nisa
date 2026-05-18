"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { hydrateFromStorage } from "@/store/slices/boutiqueUISlice";

/** Loads cart, wishlist, and boutique theme preference from browser storage once. */
export function BoutiqueHydration() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.boutiqueUi.theme);
  const hydrated = useAppSelector((s) => s.boutiqueUi.hydrated);

  useEffect(() => {
    dispatch(hydrateFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (!hydrated || typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, hydrated]);

  return null;
}
