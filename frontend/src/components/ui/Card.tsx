import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export default function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card p-5", className)} {...rest} />;
}
