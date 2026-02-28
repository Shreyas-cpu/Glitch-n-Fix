import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className }: CardProps) => (
  <div
    className={cn(
      "bg-[#151619] border border-[#141414] rounded-xl overflow-hidden",
      className
    )}
  >
    {children}
  </div>
);