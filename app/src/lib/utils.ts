import { orgConfig } from "@/config/organization";
import { type ClassValue, clsx } from "clsx";
import { env } from "process";
import { twMerge } from "tailwind-merge";

const TRIGGER_STORAGE_KEY = "workflowTriggers";
const ACTION_STORAGE_KEY = "workflowActions";
const CONDITIONS_STORAGE_KEY = "workflowConditions";
const WORKFLOW_NAME_STORAGE_KEY = "Workflow name";

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
        return (
            now.getTime() - targetDate.getTime() > value * 24 * 60 * 60 * 1000
        );
    } else if (unit === "Hours") {
        return now.getTime() - targetDate.getTime() > value * 60 * 60 * 1000;
    }
    return false;
};

export const isBefore = (
    date: string,
    value: number,
    unit: string,
): boolean => {
    const targetDate = new Date(date);
    const now = new Date();
    if (unit === "Days") {
        return (
            now.getTime() - targetDate.getTime() < value * 24 * 60 * 60 * 1000
        );
    } else if (unit === "Hours") {
        return now.getTime() - targetDate.getTime() < value * 60 * 60 * 1000;
    }
    return false;
};

export const isSame = (date: string, value: number, unit: string): boolean => {
    const targetDate = new Date(date);
    const now = new Date();
    if (unit === "Days") {
        return (
            Math.abs(now.getTime() - targetDate.getTime()) <=
            value * 24 * 60 * 60 * 1000
        );
    } else if (unit === "Hours") {
        return (
            Math.abs(now.getTime() - targetDate.getTime()) <=
            value * 60 * 60 * 1000
        );
    }
    return false;
};

// Save workflow name to local storage
export const saveWorkflowName = (name: string) => {
    localStorage.setItem(WORKFLOW_NAME_STORAGE_KEY, name);
};

// Get workflow name from local storage
export const getWorkflowName = () => {
    return localStorage.getItem(WORKFLOW_NAME_STORAGE_KEY) || "";
};

// Clear workflow name from local storage
export const clearWorkflowName = () => {
    localStorage.removeItem(WORKFLOW_NAME_STORAGE_KEY);
};

// Save trigger data to local storage
export const saveTriggerData = (data: any) => {
    localStorage.setItem(TRIGGER_STORAGE_KEY, JSON.stringify(data));
};

// Get trigger data from local storage
export const getTriggerData = () => {
    const storedData = localStorage.getItem(TRIGGER_STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : {};
};

// Save action data to local storage
export const saveActionData = (data: any) => {
    localStorage.setItem(ACTION_STORAGE_KEY, JSON.stringify(data));
};

// Get action data from local storage
export const getActionData = () => {
    const storedData = localStorage.getItem(ACTION_STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : {};
};

// Save conditions data to local storage
export const saveConditionsData = (data: any) => {
    localStorage.setItem(CONDITIONS_STORAGE_KEY, JSON.stringify(data));
};

// Get conditions data from local storage
export const getConditionsData = () => {
    const storedData = localStorage.getItem(CONDITIONS_STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : [];
};

// Clear all workflow data from local storage
export const clearWorkflowStorage = () => {
    localStorage.removeItem(TRIGGER_STORAGE_KEY);
    localStorage.removeItem(ACTION_STORAGE_KEY);
    localStorage.removeItem(CONDITIONS_STORAGE_KEY);
    clearWorkflowName(); // Clear the workflow name as well
};
