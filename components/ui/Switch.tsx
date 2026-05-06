"use client";

export function Switch({
  checked,
  onChange,
  disabled,
  "aria-label": ariaLabel,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition",
        "shadow-sm ring-1 ring-black/10",
        checked ? "bg-[#fcc4c8]/70" : "bg-white",
        disabled ? "opacity-60" : "hover:shadow-softSm",
      ].join(" ")}
      aria-pressed={checked}
    >
      <span
        className={[
          "h-5 w-5 rounded-full bg-white shadow-sm transition",
          checked ? "translate-x-5" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}
