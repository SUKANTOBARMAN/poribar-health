import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
}
export default function Button({ variant = "primary", loading, className, children, disabled, ...rest }: Props) {
  return (
    <button className={cn("btn", `btn-${variant}`, className)} disabled={disabled || loading} {...rest}>
      {loading ? "..." : children}
    </button>
  );
}
