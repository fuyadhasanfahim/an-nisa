import { forwardRef } from "react";
import { adminTextareaClass } from "./adminFieldClasses";

export const FormTextarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function FormTextarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      {...props}
      className={[adminTextareaClass, className ?? ""].filter(Boolean).join(" ")}
    />
  );
});
