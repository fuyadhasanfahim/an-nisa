import { Switch } from "@/components/ui/Switch";
import { adminInsetSurfaceClass, adminFieldLabelClass } from "./adminFieldClasses";

export function FormToggleRow({
  label,
  caption,
  leading,
  checked,
  onChange,
  disabled,
  switchAriaLabel,
  error,
}: {
  label: string;
  caption: React.ReactNode;
  leading?: React.ReactNode;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  switchAriaLabel: string;
  error?: string;
}) {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col gap-1.5">
      <div className="flex min-h-0 flex-1 flex-col gap-0.5">
        <span className={adminFieldLabelClass}>{label}</span>
      </div>
      <div
        className={[
          "flex min-h-11 shrink-0 items-center justify-between gap-3 px-3 py-2",
          adminInsetSurfaceClass,
        ].join(" ")}
      >
        <div className="flex min-w-0 items-center gap-2 text-sm text-black/70">
          {leading}
          <span className="font-medium leading-snug text-brand-black">
            {caption}
          </span>
        </div>
        <Switch
          aria-label={switchAriaLabel}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
      {error ? (
        <p className="shrink-0 text-xs text-rose-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
