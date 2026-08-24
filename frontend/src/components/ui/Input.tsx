import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface Props extends InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; }
const Input = forwardRef<HTMLInputElement, Props>(({ label, error, className, ...rest }, ref) => (
  <div>
    {label && <label className="label">{label}</label>}
    <input ref={ref} className={cn("input", error && "border-rust-500", className)} {...rest} />
    {error && <p className="mt-1 text-xs text-rust-600">{error}</p>}
  </div>
));
Input.displayName = "Input";
export default Input;
