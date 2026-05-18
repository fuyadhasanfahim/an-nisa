"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { hydrateFromStorage, setTheme } from "@/store/slices/boutiqueUISlice";

/** Loads cart, wishlist from browser storage once. Forces light mode. */
export function BoutiqueHydration() {
  const dispatch = useAppDispatch();
  const hydrated = useAppSelector((s) => s.boutiqueUi.hydrated);

  useEffect(() => {
    dispatch(hydrateFromStorage());
    // Force light mode only
    dispatch(setTheme("light"));
  }, [dispatch]);

  useEffect(() => {
    if (!hydrated || typeof document === "undefined") return;
    // Always remove dark class — light mode only
    document.documentElement.classList.remove("dark");
  }, [hydrated]);

  return null;
}
