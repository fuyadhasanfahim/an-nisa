"use client";

import { createContext, useCallback, useMemo, useState } from "react";
import { ToastViewport, type ToastData } from "@/components/shared/toast/Toast";

type ToastInput = Omit<ToastData, "id"> & { id?: string };

type ToastContextValue = {
  toast: (toast: ToastInput) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

type ToastRuntime = ToastData & { lastShownAt: number };

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastRuntime[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => setToasts([]), []);

  const toast = useCallback((input: ToastInput) => {
    const now = Date.now();
    const key = `${input.variant ?? "success"}|${input.title ?? ""}|${input.message}`;
    const id = input.id ?? `msg:${key}`;

    setToasts((prev) => {
      const existing = prev.find((t) => t.id === id);
      if (existing) {
        const withinWindow = now - existing.lastShownAt < 1500;
        if (withinWindow) return prev; // ignore duplicates fired rapidly

        // Update existing + restart its timer by bumping version
        return prev.map((t) =>
          t.id === id
            ? {
                ...t,
                title: input.title ?? t.title,
                message: input.message ?? t.message,
                variant: input.variant ?? t.variant,
                durationMs: input.durationMs ?? t.durationMs,
                version: (t.version ?? 0) + 1,
                lastShownAt: now,
              }
            : t
        );
      }

      const next: ToastRuntime = {
        id,
        title: input.title,
        message: input.message,
        variant: input.variant ?? "success",
        durationMs: input.durationMs ?? 4500,
        version: 0,
        lastShownAt: now,
      };

      // Keep it premium: cap stack at 3
      return [next, ...prev].slice(0, 3);
    });

    return id;
  }, []);

  const value = useMemo(
    () => ({ toast, dismiss, dismissAll }),
    [toast, dismiss, dismissAll]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onClose={dismiss} />
    </ToastContext.Provider>
  );
}

