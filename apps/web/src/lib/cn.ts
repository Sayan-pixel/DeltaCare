import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combines Tailwind class names cleanly without specificity collisions. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

