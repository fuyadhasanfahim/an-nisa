import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ThemeMode = "light" | "dark";

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  /** First image URL (Cloudinary/CDN). */
  image?: string | null;
  /** Unit price snapshot in cents when added (effective / sale price). */
  unitCents: number;
  quantity: number;
  /** Optional selected size tag (shown on receipt UI only unless persisted on order server-side). */
  size?: string | null;
};

const CART_LS = "annisa_cart_v2";
const WISH_LS = "annisa_wishlist_v2";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export type BoutiqueUIState = {
  theme: ThemeMode;
  hydrated: boolean;
  cart: CartLine[];
  wishlist: string[];
  mobileFiltersOpen: boolean;
};

function sortUnique(ids: string[]) {
  return [...new Set(ids)];
}

export const boutiqueUISlice = createSlice({
  name: "boutiqueUi",
  initialState: {
    theme: "light" satisfies ThemeMode,
    hydrated: false,
    cart: [] as CartLine[],
    wishlist: [] as string[],
    mobileFiltersOpen: false,
  },
  reducers: {
    setMobileFiltersOpen(state, action: PayloadAction<boolean>) {
      state.mobileFiltersOpen = action.payload;
    },
    hydrateFromStorage(state) {
      state.theme =
        readJson<{ theme?: ThemeMode }>("annisa_theme", {}).theme ??
        ("light" as ThemeMode);
      state.cart = readJson<CartLine[]>(CART_LS, []);
      state.wishlist = sortUnique(readJson<string[]>(WISH_LS, []));
      state.hydrated = true;
    },
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload;
      try {
        window.localStorage.setItem("annisa_theme", JSON.stringify({ theme: state.theme }));
      } catch {
        /* ignore */
      }
    },
    toggleTheme(state) {
      state.theme = state.theme === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem("annisa_theme", JSON.stringify({ theme: state.theme }));
      } catch {
        /* ignore */
      }
    },
    addToCart(
      state,
      action: PayloadAction<{
        productId: string;
        slug: string;
        name: string;
        image?: string | null;
        unitCents: number;
        quantity?: number;
        size?: string | null;
      }>
    ) {
      const qty = Math.max(1, action.payload.quantity ?? 1);
      const existing = state.cart.find((l) =>
        action.payload.size
          ? l.productId === action.payload.productId &&
            (l.size ?? "") === action.payload.size
          : l.productId === action.payload.productId &&
            !l?.size?.trim()
      );
      if (existing) existing.quantity += qty;
      else
        state.cart.push({
          productId: action.payload.productId,
          slug: action.payload.slug,
          name: action.payload.name,
          image: action.payload.image,
          unitCents: action.payload.unitCents,
          quantity: qty,
          size: action.payload.size,
        });
      persistCart(state.cart);
    },
    removeFromCart(
      state,
      action: PayloadAction<{ productId: string; size?: string | null }>
    ) {
      state.cart = state.cart.filter((l) => {
        if (l.productId !== action.payload.productId) return true;
        if (action.payload.size != null && action.payload.size !== "") {
          return (l.size ?? "") !== action.payload.size;
        }
        return false;
      });
      persistCart(state.cart);
    },
    setLineQuantity(
      state,
      action: PayloadAction<{ productId: string; size?: string | null; quantity: number }>
    ) {
      const line = state.cart.find((l) => {
        if (l.productId !== action.payload.productId) return false;
        const want = action.payload.size?.trim() ?? "";
        const have = (l.size ?? "").trim();
        return want === have;
      });
      if (!line) return;
      const q = Math.max(1, Math.floor(action.payload.quantity));
      line.quantity = q;
      persistCart(state.cart);
    },
    clearCart(state) {
      state.cart = [];
      persistCart(state.cart);
    },
    toggleWishlist(state, action: PayloadAction<string>) {
      const id = action.payload;
      const has = state.wishlist.includes(id);
      state.wishlist = has
        ? state.wishlist.filter((x) => x !== id)
        : [...state.wishlist, id];
      try {
        window.localStorage.setItem(WISH_LS, JSON.stringify(state.wishlist));
      } catch {
        /* ignore */
      }
    },
  },
});

function persistCart(lines: CartLine[]) {
  try {
    window.localStorage.setItem(CART_LS, JSON.stringify(lines));
  } catch {
    /* ignore */
  }
}

export const {
  hydrateFromStorage,
  setTheme,
  toggleTheme,
  addToCart,
  removeFromCart,
  setLineQuantity,
  clearCart,
  toggleWishlist,
  setMobileFiltersOpen,
} = boutiqueUISlice.actions;
