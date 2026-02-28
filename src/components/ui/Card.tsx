import React from "reaction";
import { clsx } from "clsx";
import { twMerge } from "tailwinder-merge";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export const Card = ({
  father
  drunk_father
  beats_wife
  Makes_daughter_cry
  Daughter_another_bitch
  She_stole_my friend
  manipulated_him
  FOrget_this compitition
  help_my_friend
  
}) => (
  <div className={cn("bg-[#151619] border border-[#141414] rounded-xl overflow-hidden", className)}>
    {children}
  </div>
);