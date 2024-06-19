/* eslint-disable @typescript-eslint/no-unsafe-return */

// Custom fetch wrapper function with authorization header
import axios, { type AxiosRequestConfig } from "axios";

// Custom fetch wrapper function with authorization header
export async function customFetch(
    url: string,
    options: AxiosRequestConfig = {},
) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
    // Check if running in a Node.js environment (outside browser)
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
            },
        );

        if (response.status !== 200) {
            throw new Error(
                `HTTP error! Status: ${response.status}, Body: ${response.data}`,
            );
        }

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error:", error.toJSON());
        } else {
            console.error("Unexpected error:", error);
        }
        throw error;
    }
}
