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
