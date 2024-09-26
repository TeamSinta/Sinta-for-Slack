import { orgConfig } from "@/config/organization";
import { env } from "@/env";
import { type ClassValue, clsx } from "clsx";
import crypto from "crypto";
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
    return pathname.startsWith(href);
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

// Convert HTML (particularly from react quill) to slack markdown
export const convertHtmlToSlackMrkdwn = (html: string) => {
    // Convert <p> to single newlines (line breaks in Slack)
    html = html.replace(/<\/?p>/g, "\n");

    // Convert "<p><br></p>" to "/n" (Creating a new line in react quill is represented as <p><br></p>)
    html = html.replace(/<p>\s*<br\s*\/?>\s*<\/p>/g, "\n");

    // Convert <strong> and <b> to Slack's bold (*text*)
    html = html.replace(/<(b|strong)>(.*?)<\/\1>/g, "*$2*");

    // Convert <em> and <i> to Slack's italic (_text_)
    html = html.replace(/<(i|em)>(.*?)<\/\1>/g, "_$2_");

    // Convert <del>, <s>, and <strike> to Slack's strikethrough (~text~)
    html = html.replace(/<(del|s|strike)>(.*?)<\/\1>/g, "~$2~");

    // Convert <a> to Slack's link (<url|text>)
    html = html.replace(/<a href="(.*?)".*?>(.*?)<\/a>/g, "<$1|$2>");

    // Convert <ul> and <ol> lists to Slack-style lists
    // Unordered list
    html = html.replace(
        /<ul>\s*(<li>.*?<\/li>)\s*<\/ul>/gs,
        (match: string, p1: string) => p1.replace(/<li>(.*?)<\/li>/g, "• $1"),
    );

    // Ordered list
    html = html.replace(
        /<ol>\s*(<li>.*?<\/li>)\s*<\/ol>/gs,
        (match: string, p1: string) => p1.replace(/<li>(.*?)<\/li>/g, "1. $1"),
    );

    // Convert <blockquote> to Slack's blockquote (> text)
    html = html.replace(/<blockquote>(.*?)<\/blockquote>/g, "> $1");

    // Convert <code> to Slack's inline code (`code`)
    html = html.replace(/<code>(.*?)<\/code>/g, "`$1`");

    // Convert <pre> to Slack's block code (```code```)
    html = html.replace(/<pre>(.*?)<\/pre>/g, "```\n$1\n```");

    // Remove any remaining HTML tags (optional)
    html = html.replace(/<\/?[^>]+(>|$)/g, "");

    return html;
};

export function thousandToK(value: number) {
    return value / 1000;
}

export function verifySignature(
    signature: string | null,
    body: string,
    secret: string | undefined,
): boolean {
    if (!signature || !secret) return false;

    // Extract the hash from the signature (everything after "sha256 ")
    const hash = signature.split(" ")[1];

    // Create an HMAC using the secret key and the request body
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(body);
    const computedHash = hmac.digest("hex");

    // Compare the computed HMAC with the one sent in the signature header
    if (typeof hash === "undefined") {
        return false;
    }
    return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(hash));
}

// Remove all keys with falsey values
export const cleanObject = (obj: object) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([key, value]) => Boolean(value)),
    );
};

export const getMergentTaskName = (
    eventName: string,
    workflowId: string,
    objectName: string,
    id: string,
): string => {
    return `${eventName}-${workflowId}-${objectName}-${id}`;
};

export function adjustDateTime(
    date: Date,
    flag: "before" | "after",
    days: number,
    hours: number,
): Date {
    const millisecondsInADay = 24 * 60 * 60 * 1000;
    const millisecondsInAnHour = 60 * 60 * 1000;

    // Calculate the total offset in milliseconds
    const totalOffset =
        days * millisecondsInADay + hours * millisecondsInAnHour;

    // Create a new Date object adjusted by the offset
    const adjustedDate = new Date(date);

    if (flag === "before") {
        adjustedDate.setTime(adjustedDate.getTime() - totalOffset);
    } else if (flag === "after") {
        adjustedDate.setTime(adjustedDate.getTime() + totalOffset);
    }

    return adjustedDate;
}

export function formatListToString(items: string[]): string {
    if (items.length === 0) {
        return "";
    }

    if (items.length === 1) {
        return items[0] ?? ""; // Handle possible undefined
    }

    if (items.length === 2) {
        return `${items[0] ?? ""} and ${items[1] ?? ""}`;
    }

    // For 3 or more items, join all except the last with commas, and add 'and' before the last item
    const lastItem = items.pop();
    return `${items.join(", ")}, and ${lastItem ?? ""}`;
}

export function formatToReadableDate(dateString: string): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        weekday: "long", // 'Monday', 'Tuesday', etc.
        year: "numeric",
        month: "long", // 'January', 'February', etc.
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true, // Use 12-hour time format
    };

    return new Intl.DateTimeFormat("en-US", options).format(date);
}
