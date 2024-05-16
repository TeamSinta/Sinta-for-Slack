"use server";

import { NextResponse } from "next/server";
import { getWorkflows } from "@/server/actions/workflows/queries";
import {
    filterDataWithConditions,
    filterStuckinStageDataConditions,
    processData,
} from "@/server/greenhouse/core";
import { env } from "@/env";
import { filterProcessedForSlack } from "@/lib/slack";
import {
    sendSlackButtonNotification,
    sendSlackNotification,
} from "@/server/slack/core";

// Define your API token
const API_TOKEN = env.GREENHOUSE_API_HARVEST;

// Custom fetch wrapper function with authorization header
export const customFetch = async (
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

export async function POST() {
    try {
        const workflows = await getWorkflows(); // Retrieve workflows from the database
        let shouldReturnNull = false; // Flag to determine whether to return null

        for (const workflow of workflows) {
            if (workflow.alertType === "timebased") {
                const { apiUrl } = workflow.triggerConfig; // Now using the parsed object

                const data = await customFetch(apiUrl); // Fetch data using custom fetch wrapper
                // console.log("Data from Greenhouse API:", data); // Log the data to verify it has arrived

                const filteredConditionsData = filterDataWithConditions(
                    data,
                    workflow.conditions,
                );
                // console.log("Data from Greenhouse API:", workflow.conditions);
                // console.log("Data from Conditions API:", filteredConditionsData); // Log the data to verify it has arrived

                if (filteredConditionsData.length === 0) {
                    // console.log("No data found for conditions in one of the workflows.");
                    shouldReturnNull = true; // Set flag to true
                } else {
                    const filteredSlackData = filterProcessedForSlack(
                        filteredConditionsData,
                        workflow.recipient,
                    );
                    // console.log("Filtered from Slack API:", filteredSlackData); // Log the data to verify it has arrived
                    await sendSlackNotification(
                        filteredSlackData,
                        workflow.recipient,
                    );
                }
            } else if (workflow.alertType === "stuck-in-stage") {
                const { apiUrl, processor } = workflow.triggerConfig; // Now using the parsed object

                const data = await customFetch(apiUrl, processor); // Fetch data using custom fetch wrapper
                // console.log("Greenhouse  Data:", data); // Log the data to verify it has arrived

                // Filter data based on the "stuck-in-stage" conditions
                const filteredConditionsData =
                    await filterStuckinStageDataConditions(
                        data,
                        workflow.conditions,
                    );
                console.log(
                    "Filtered Conditions Data:",
                    filteredConditionsData,
                ); // Log the data to verify it has arrived

                const filteredSlackData = filterProcessedForSlack(
                    filteredConditionsData,
                    workflow.recipient,
                );
                console.log("Filtered from Slack API:", filteredSlackData); // Log the data to verify it has arrived
                await sendSlackButtonNotification(
                    filteredSlackData,
                    workflow.recipient,
                );
            } else if (workflow.alertType === "create-update") {
                // Logic for "create-update" conditions
            }
        }

        if (shouldReturnNull) {
            console.log(
                "Returning null due to empty data set in one or more workflows.",
            );
            return null; // Return null if any workflow resulted in empty data
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
            JSON.stringify({
                error: "Failed to process workflows",
                details: error.message,
            }),
            {
                status: 500,
            },
        );
    }
}
