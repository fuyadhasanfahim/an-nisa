"use client";

import type { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { AppQueryProvider } from "@/store/query-client-provider";
import { BoutiqueHydration } from "@/components/shop/BoutiqueHydration";

export function Providers({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <AppQueryProvider>
        <BoutiqueHydration />
        {children}
      </AppQueryProvider>
    </Provider>
  );
}
