import { NextResponse } from "next/server";
import { getWorkflows } from "@/server/actions/workflows/queries";
import {
    filterDataWithConditions,
    processData,
} from "@/server/greenhouse/core";
import { env } from "@/env";
import { filterProcessedForSlack } from "@/lib/slack";
import { sendSlackNotification } from "@/server/slack/core";

// Define your API token
const API_TOKEN = env.GREENHOUSE_API_HARVEST;

// Custom fetch wrapper function with authorization header
const customFetch = async (
    url: string,
    options: RequestInit = {},
): Promise<any> => {
    const headers: HeadersInit = {
        Authorization: `Basic ${btoa(API_TOKEN + ":")}`, // Encode API token for Basic Auth
        ...options.headers,
    };
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
};

export const dynamic = "force-dynamic";

export async function POST() {
    try {
        const workflows = await getWorkflows(); // Retrieve workflows from the database
        for (const workflow of workflows) {
            if (workflow.alertType === "stuck-in-stage") {
              const { apiUrl, processor } = workflow.triggerConfig;  // Now using the parsed object

                const data = await customFetch(apiUrl); // Fetch data using custom fetch wrapper
                console.log("Data from Greenhouse API:", data); // Log the data to verify it has arrived

                const filteredConditionsData = filterDataWithConditions(
                    data,
                    workflow.conditions,
                );

                console.log("Data from Conditions API:", filteredConditionsData); // Log the data to verify it has arrived

                // const processedData = processData(
                //     filteredConditionsData,
                //     processor,
                // );

                // Implement this function to process data


                const filteredSlackData = filterProcessedForSlack(filteredConditionsData, workflow.recipient);
                console.log("Filtered from Slack API:", filteredSlackData); // Log the data to verify it has arrived


                await sendSlackNotification(filteredSlackData, workflow.recipient);
            } else if (workflow.alertType === "time-based") {
                // Placeholder for time-based condition
            } else if (workflow.alertType === "create-update") {
                // Placeholder for create/update condition
            }
        }
        return new NextResponse(
            JSON.stringify({ message: "Workflows processed successfully" }),
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error("Failed to process workflows:", error);
        return new NextResponse(
            JSON.stringify({ error: "Failed to process workflows" }),
            {
                status: 500,
            },
        );
    }
}
