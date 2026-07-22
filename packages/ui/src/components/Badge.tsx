import * as React from "react";
import { cn } from "../utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger";
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-blue-50 text-primary border-blue-100",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-orange-50 text-orange-700 border-orange-200",
  danger: "bg-red-50 text-red-700 border-red-200",
};

export function Badge({ variant = "default", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold capitalize border",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
