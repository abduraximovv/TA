"use client";

import * as React from "react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id ?? generatedId;
    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold text-gray-700 select-none">
            {label}
          </label>
        )}
        <select
          id={selectId}
          className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all ${className}`}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {error && <span className="text-xs text-error font-medium">{error}</span>}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
