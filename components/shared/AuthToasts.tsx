"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/shared/toast/useToast";

type ToastKind =
  | "signed-in"
  | "signed-out"
  | "auth-required"
  | "banned";

function messageFor(kind: ToastKind) {
  switch (kind) {
    case "signed-in":
      return "Signed in successfully.";
    case "signed-out":
      return "You’ve been signed out.";
    case "auth-required":
      return "Please sign in to continue.";
    case "banned":
      return "This account has been blocked. Contact support if this is a mistake.";
  }
}

export function AuthToasts() {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const toastKindFromUrl = useMemo(() => {
    const v = searchParams.get("toast");
    if (
      v === "signed-in" ||
      v === "signed-out" ||
      v === "auth-required" ||
      v === "banned"
    )
      return v;
    return null;
  }, [searchParams]);

  useEffect(() => {
    if (!toastKindFromUrl) return;

    const kind = toastKindFromUrl;
    toast({
      id: `auth:${kind}:${pathname}`,
      title:
        kind === "signed-in"
          ? "Signed in"
          : kind === "signed-out"
            ? "Signed out"
            : kind === "banned"
              ? "Account blocked"
              : "Authentication required",
      message: messageFor(kind),
      variant:
        kind === "auth-required"
          ? "warning"
          : kind === "banned"
            ? "error"
            : "success",
      durationMs: 4500,
    });

    const params = new URLSearchParams(searchParams.toString());
    params.delete("toast");
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toastKindFromUrl]);

  return null;
}

