/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

"use server";

import { NextResponse } from "next/server";
import { getWorkflows } from "@/server/actions/workflows/queries";
import {
    filterDataWithConditions,
    filterStuckinStageDataConditions,
} from "@/server/greenhouse/core";
import { filterProcessedForSlack } from "@/lib/slack";
import {
    sendSlackButtonNotification,
    sendSlackNotification,
} from "@/server/slack/core";
import { customFetch } from "@/utils/fetch";


export async function POST() {
    try {
        const workflows: Workflow[] = await getWorkflows(); // Retrieve workflows from the database
        let shouldReturnNull = false; // Flag to determine whether to return null

        for (const workflow of workflows) {
            if (workflow.alertType === "timebased") {
                const { apiUrl } = workflow.triggerConfig;
                const data = await customFetch(apiUrl); // Fetch data using custom fetch wrapper
                console.log(data)

                const filteredConditionsData = filterDataWithConditions(
                    data,
                    workflow.conditions
                );

                if (filteredConditionsData.length === 0) {
                    shouldReturnNull = true; // Set flag to true
                } else {
                    const filteredSlackData = filterProcessedForSlack(
                        filteredConditionsData,
                        workflow.recipient
                    );
                    await sendSlackNotification(
                        filteredSlackData,
                        workflow.recipient
                    );
                }
            } else if (workflow.alertType === "stuck-in-stage") {
                const { apiUrl, processor } = workflow.triggerConfig;
                const data = await customFetch(apiUrl, processor ? { query: processor } : {});
                console.log(data)
                // Filter data based on the "stuck-in-stage" conditions
                const filteredConditionsData = await filterStuckinStageDataConditions(
                    data,
                    workflow.conditions
                );

                const filteredSlackData = filterProcessedForSlack(
                    filteredConditionsData,
                    workflow.recipient
                );
                await sendSlackButtonNotification(
                    filteredSlackData,
                    workflow.recipient
                );
            } else if (workflow.alertType === "create-update") {
                // Logic for "create-update" conditions
            }
        }

        if (shouldReturnNull) {
            return new NextResponse(
                JSON.stringify({ message: "No workflows to process" }),
                { status: 200 }
            );
        }

        return new NextResponse(
            JSON.stringify({ message: "Workflows processed successfully" }),
            {
                status: 200,
            }
        );
    } catch (error: unknown) {
        console.error("Failed to process workflows:", error);
        return new NextResponse(
            JSON.stringify({
                error: "Failed to process workflows",
                details: (error as Error).message,
            }),
            {
                status: 500,
            }
        );
    }
}
