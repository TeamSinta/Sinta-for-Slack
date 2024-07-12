/* eslint-disable @typescript-eslint/no-unsafe-return */

import axios, { type AxiosRequestConfig } from "axios";

export async function customFetch(
    url: string,
    options: AxiosRequestConfig = {},
) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
    const isNode = typeof window === "undefined";
    const apiUrl = isNode ? `${baseUrl}/api/greenhouse/` : "/api/greenhouse/";

    try {
        const response = await axios.post(
            apiUrl,
            { url, options },
            {
                headers: {
                    "Content-Type": "application/json",
                },
                timeout: 10000, // 10 seconds timeout
            },
        );

        if (response.status !== 200) {
            throw new Error(
                `HTTP error! Status: ${response.status}, Body: ${JSON.stringify(response.data)}`,
            );
        }

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Response status:", error.response?.status);
            console.error("Response data:", error.response?.data);
        } else {
            console.error("Unexpected error:", error);
        }
        throw error;
    }
}
