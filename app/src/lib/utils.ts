import { orgConfig } from "@/config/organization";
import { type ClassValue, clsx } from "clsx";
import { env } from "process";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// it tells you if the current link is active or not based on the pathname
export function isLinkActive(href: string, pathname: string) {
    return pathname === href;
}

export function setOrgCookie(orgId: string) {
    document.cookie = `${orgConfig.cookieName}=${orgId}; path=/; max-age=31536000;`;
}

export function getAbsoluteUrl(path: string) {
    return `${env.NEXTAUTH_URL}${path}`;
}

// Custom fetch wrapper function with authorization header


export const isAfter = (date: string, value: number, unit: string): boolean => {
  const targetDate = new Date(date);
  const now = new Date();
  if (unit === "Days") {
      return now.getTime() - targetDate.getTime() > value * 24 * 60 * 60 * 1000;
  } else if (unit === "Hours") {
      return now.getTime() - targetDate.getTime() > value * 60 * 60 * 1000;
  }
  return false;
};

export const isBefore = (date: string, value: number, unit: string): boolean => {
  const targetDate = new Date(date);
  const now = new Date();
  if (unit === "Days") {
      return now.getTime() - targetDate.getTime() < value * 24 * 60 * 60 * 1000;
  } else if (unit === "Hours") {
      return now.getTime() - targetDate.getTime() < value * 60 * 60 * 1000;
  }
  return false;
};

export const isSame = (date: string, value: number, unit: string): boolean => {
  const targetDate = new Date(date);
  const now = new Date();
  if (unit === "Days") {
      return Math.abs(now.getTime() - targetDate.getTime()) <= value * 24 * 60 * 60 * 1000;
  } else if (unit === "Hours") {
      return Math.abs(now.getTime() - targetDate.getTime()) <= value * 60 * 60 * 1000;
  }
  return false;
};
