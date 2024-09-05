/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { type NextRequest, NextResponse } from "next/server";
import axios from "axios";
export const dynamic = "force-dynamic";
async function handleGreenhouseCandidateRequest(url: string, options: any) {
    // async function handleGreenhouseCandidateRequest(url: string, options: RequestInit & { query?: Record<string, string> }) {
    // const headers: HeadersInit = {
    //     "Authorization": `Basic ${process.env.GREENHOUSE_API_KEY}`, // Basic Auth token
    //     "Content-Type": "application/json",
    //     "On-Behalf-Of": options.headers?.['On-Behalf-Of'] || "", // Use provided On-Behalf-Of or default
    // };
    const headers: HeadersInit = {
        Authorization: `Basic MjVhN2I2ZWY3M2Q5MzhmZWZlNDk3MmM0ODMyYzAyYTYtODo=`, // Basic Auth token
        "Content-Type": "application/json",
        "On-Behalf-Of": "4036341008", // Greenhouse user ID for auditing
        // ...options.headers,
    };
    console.log("ehaders - ", headers);
    let requestUrl = url;
    if (options.query) {
        const queryParams = new URLSearchParams(options.query).toString();
        requestUrl = `${url}?${queryParams}`;
    }

    // console.log('Request URL:', requestUrl);
    // console.log('Headers:', headers);
    // console.log('options',options)
    // console.log('options',options.method)
    // console.log('options',options.data)
    const response = await axios({
        url: requestUrl,
        method: options.method,
        headers: headers,
        data: options?.data,
    });

    if (response.status < 200 || response.status >= 300) {
        throw new Error(
            `HTTP error! Status: ${response.status}, Body: ${JSON.stringify(response.data)}`,
        );
    }
    const respData = response.data;
    return respData;
}
export async function POST(request: NextRequest) {
    try {
        const {
            url,
            options,
        }: {
            url: string;
            options: RequestInit & { query?: Record<string, string> };
        } = await request.json();
        if (!url) {
            return NextResponse.json(
                { error: "URL not provided" },
                { status: 400 },
            );
        }

        const apiToken = "25a7b6ef73d938fefe4972c4832c02a6";
        if (!apiToken) {
            return NextResponse.json(
                { error: "API token not found for the current organization" },
                { status: 400 },
            );
        }
        // console.log('options - ',options)
        const headers: HeadersInit = {
            Authorization: `Basic MjVhN2I2ZWY3M2Q5MzhmZWZlNDk3MmM0ODMyYzAyYTYtODo=`, // Basic Auth token
            "Content-Type": "application/json",
            "On-Behalf-Of": "4036341008", // Greenhouse user ID for auditing
            // ...options.headers,
        };
        if (url.includes("/v1/candidates/")) {
            // const optData = options.data
            // return NextResponse.json({});

            // const response = await fetch(requestUrl, { ...options, headers });
            const responseData = await handleGreenhouseCandidateRequest(
                url,
                options,
            );
            return NextResponse.json(responseData);
        } else {
            let requestUrl = url;
            if (options.query) {
                const queryParams = new URLSearchParams(
                    options.query,
                ).toString();
                requestUrl = `${url}?${queryParams}`;
            }
            const response = await fetch(requestUrl, { ...options, headers });

            if (!response.ok) {
                return NextResponse.json(
                    { error: `HTTP error! Status: ${response.status}` },
                    { status: response.status },
                );
            }

            const responseData = await response.json();
            // console.log('respdata? - ',responseData)
            return NextResponse.json(responseData);
        }
    } catch (error) {
        console.log("errorr - ", error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 },
        );
    }
}
