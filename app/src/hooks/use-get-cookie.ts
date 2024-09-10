"use client";
import { useState, useEffect } from "react";

// Custom hook to get a specific cookie by name
const useGetCookie = (cookieName: string) => {
    const [cookieValue, setCookieValue] = useState<string | null | undefined>(
        null,
    );

    useEffect(() => {
        if (typeof document !== "undefined") {
            const cookie = document.cookie
                .split("; ")
                .find((row) => row.startsWith(`${cookieName}=`));
            const value = cookie ? cookie.split("=")[1] : null;
            setCookieValue(value);
        }
    }, [cookieName]); // Re-run if the cookie name changes

    return cookieValue;
};

export default useGetCookie;
