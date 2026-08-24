import { type SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> { label?: string; }
const Select = forwardRef<HTMLSelectElement, Props>(({ label, className, children, ...rest }, ref) => (
  <div>
    {label && <label className="label">{label}</label>}
    <select ref={ref} className={cn("input", className)} {...rest}>{children}</select>
  </div>
));
Select.displayName = "Select";
export default Select;
