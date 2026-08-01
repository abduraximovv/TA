import * as React from "react";
import { Card } from "./Card";
import { cn } from "../utils";

export interface StatTileProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  hint?: string;
  className?: string;
}

export function StatTile({ label, value, icon, hint, className }: StatTileProps) {
  return (
    <Card className={cn("p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <h3 className="text-3xl font-display font-semibold text-gray-900 mt-2 tracking-tight">{value}</h3>
          {hint && <p className="text-xs text-gray-400 mt-2">{hint}</p>}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded flex items-center justify-center bg-secondary/15 text-primary shrink-0">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
