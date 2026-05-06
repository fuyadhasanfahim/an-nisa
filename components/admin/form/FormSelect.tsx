import { forwardRef } from "react";
import { IconChevronDown } from "@tabler/icons-react";
import { adminControlClass } from "./adminFieldClasses";

export const FormSelect = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function FormSelect({ className, disabled, children, ...props }, ref) {
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        disabled={disabled}
        className={[
          adminControlClass,
          "cursor-pointer appearance-none pr-10",
          "disabled:cursor-not-allowed disabled:opacity-60",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </select>
      <IconChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40"
        stroke={2}
        aria-hidden
      />
    </div>
  );
});
