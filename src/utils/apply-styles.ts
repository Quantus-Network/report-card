import type { ClassValue } from "clsx";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export const applyStyles = (...classList: ClassValue[]) =>
  twMerge(clsx(...classList));
