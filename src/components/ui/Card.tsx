import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export const Card = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "bg-[#151619] border border-[#141414] rounded-xl overflow-hidden",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);
