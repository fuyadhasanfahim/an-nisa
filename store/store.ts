import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@/store/api/baseApi";
import "@/store/api/productsApi";
import "@/store/api/ordersApi";
import "@/store/api/invoicesApi";
import "@/store/api/earningsApi";
import "@/store/api/expensesApi";
import "@/store/api/usersApi";
import "@/store/api/overviewApi";
import "@/store/api/customerOrdersApi";
import { boutiqueUISlice } from "@/store/slices/boutiqueUISlice";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [boutiqueUISlice.name]: boutiqueUISlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

