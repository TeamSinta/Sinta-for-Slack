/* eslint-disable @typescript-eslint/no-unsafe-argument */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

"use server";

import { NextResponse } from "next/server";
import { getWorkflows } from "@/server/actions/workflows/queries";
import {
    filterDataWithConditions,
    filterStuckinStageDataConditions,
} from "@/server/greenhouse/core";
import { env } from "@/env";
import { filterProcessedForSlack } from "@/lib/slack";
import {
    sendSlackButtonNotification,
    sendSlackNotification,
} from "@/server/slack/core";
import { type z } from "zod";
import { type workflowFormSchema } from "@/app/(app)/(user)/workflows/_components/new-workflowForm";

// Define your API token
const API_TOKEN = env.GREENHOUSE_API_HARVEST;

export type Workflow = z.infer<typeof workflowFormSchema>;

interface CustomFetchOptions extends RequestInit {
    headers?: HeadersInit;
}

// Custom fetch wrapper function with authorization header
export const customFetch = async (
  url: string,
  options: CustomFetchOptions = {}
): Promise<Record<string, unknown>[]> => {
  const headers: HeadersInit = {
    Authorization: `Basic ${btoa(API_TOKEN + ":")}`, // Encode API token for Basic Auth
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (options.query) {
      const queryParams = new URLSearchParams(options.query as Record<string, string>).toString();
      url = `${url}?${queryParams}`;
  }

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const responseData = (await response.json()) as Record<string, unknown>[];
  return responseData;
};

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
