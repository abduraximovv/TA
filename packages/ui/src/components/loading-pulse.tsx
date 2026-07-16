import * as React from "react";

export function LoadingPulse({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        className="animate-pulse h-12 w-12 text-primary"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2l2.828 2.828L19.172 2.828 19.172 7.172 23.515 7.172 20.686 10 23.515 12.828 19.172 12.828 19.172 17.172 14.828 17.172 12 20.001 9.172 17.172 4.828 17.172 4.828 12.828 0.485 12.828 3.314 10 0.485 7.172 4.828 7.172 4.828 2.828 9.172 2.828 12 0z" />
      </svg>
    </div>
  );
}
