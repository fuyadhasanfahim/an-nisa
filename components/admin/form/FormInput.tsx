import { forwardRef } from "react";
import { adminControlClass } from "./adminFieldClasses";

export const FormInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function FormInput({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      {...props}
      className={[adminControlClass, className ?? ""].filter(Boolean).join(" ")}
    />
  );
});
