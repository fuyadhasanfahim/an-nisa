"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { IconCommand, IconLogout } from "@tabler/icons-react";
import { authClient } from "@/lib/auth/auth-client";

export type ProfileMenuUser = {
  name: string;
  email: string;
  image: string | null;
};

type ProfileMenuProps = {
  user: ProfileMenuUser;
  /** Admin layout sends users back through sign-in with a toast; storefront stays put. */
  signOutMode?: "redirect-sign-in" | "refresh-only";
  /** Extra rows above logout (e.g. link to admin). */
  menuExtras?: ReactNode;
};

export function ProfileMenu({
  user,
  signOutMode = "refresh-only",
  menuExtras,
}: ProfileMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className={[
          "flex items-center gap-2.5 rounded-full bg-white/75 pl-2 pr-2 sm:pr-4 py-2 shadow-sm border border-[#fcc4c8]/50 transition-all duration-300",
          "hover:shadow-softSm hover:bg-[#fcc4c8]/15 hover:border-[#fcc4c8]",
          "focus:outline-none focus:ring-2 focus:ring-[#fcc4c8]/40",
        ].join(" ")}
      >
        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-black/5">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="grid h-full w-full place-items-center">
              <IconCommand className="h-5 w-5 text-black/55" stroke={1.8} />
            </div>
          )}
        </div>

        <div className="hidden text-left sm:block">
          <div className="text-xs font-medium text-black/75">{user.name}</div>
          <div className="text-[11px] text-black/45">{user.email}</div>
        </div>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="User menu"
          className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-black/5"
        >
          <div className="px-4 py-4">
            <div className="text-xs font-medium text-black/50">Signed in as</div>
            <div className="mt-1 text-sm font-medium text-brand-black">
              {user.name}
            </div>
            <div className="mt-0.5 text-xs text-black/55">{user.email}</div>
          </div>

          <div className="h-px bg-black/5" />

          {menuExtras ? (
            <>
              <div className="p-2">{menuExtras}</div>
              <div className="h-px bg-black/5" />
            </>
          ) : null}

          <div className="p-2">
            <button
              type="button"
              role="menuitem"
              onClick={async () => {
                try {
                  setOpen(false);
                  await authClient.signOut();
                } finally {
                  if (signOutMode === "redirect-sign-in") {
                    const callbackUrl = pathname || "/admin";
                    const params = new URLSearchParams();
                    params.set("toast", "signed-out");
                    params.set("callbackUrl", callbackUrl);
                    router.push(`/sign-in?${params.toString()}`);
                  }
                  router.refresh();
                }
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-black/70 transition hover:bg-black/5 hover:text-brand-black"
            >
              <IconLogout className="h-4 w-4" stroke={1.8} />
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
