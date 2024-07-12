/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { getEmailsfromSlack } from "@/server/slack/core";
import {
    fetchGreenhouseUsers,
    filterScheduledInterviewsWithConditions,
} from "@/server/greenhouse/core";
import { NextResponse } from "next/server";
import { getWorkflows,} from "@/server/actions/workflows/queries";
import {
    filterDataWithConditions,
    filterStuckinStageDataConditions,
} from "@/server/greenhouse/core";
import {
    filterProcessedForSlack,
    filterScheduledInterviewsDataForSlack,
    matchUsers,
} from "@/lib/slack";
import {
    sendSlackButtonNotification,
    sendSlackNotification,
} from "@/server/slack/core";
import { customFetch } from "@/utils/fetch";
import { getSlackTeamIDByWorkflowID } from "@/server/actions/slack/query";
import { getSubdomainByWorkflowID } from "@/server/actions/organization/queries";
import { processCandidates, processScheduledInterviews } from "@/server/objectworkflows/queries";
import { WorkflowData } from "@/app/(app)/(user)/workflows/_components/columns";

// Define the GET handler for the route
export async function GET() {
    try {
        const workflows: WorkflowData[] = await getWorkflows() as WorkflowData[]; // Retrieve workflows from the database
        let shouldReturnNull = false; // Flag to determine whether to return null

        for (const workflow of workflows) {
            if (workflow.alertType === "timebased") {
                const { apiUrl }: { apiUrl?: string } = workflow.triggerConfig as { apiUrl?: string };

                const data = await customFetch(apiUrl ?? ""); // Fetch data using custom fetch wrapper
                let filteredConditionsData;

                switch (workflow.objectField) {
                  case "Scheduled Interviews":
                      filteredConditionsData = await processScheduledInterviews(data, workflow);
                      break;
                  case "Candidates":
                      filteredConditionsData = await processCandidates(data, workflow);
                      break;
                  default:
                      filteredConditionsData = filterDataWithConditions(data, workflow.conditions);
                      break;
              }
                if (filteredConditionsData.length === 0) {
                    shouldReturnNull = true; // Set flag to true
                } else {
                    console.log("No conditions running");
                }
            } else if (workflow.alertType === "stuck-in-stage") {
                const { apiUrl, processor } = workflow.triggerConfig;
                const data = await customFetch(
                    apiUrl,
                    processor ? { query: processor } : {},
                );
                console.log("cron-job running!!");
                // console.log("cron-job running!! - data ",data);
                // Filter data based on the "stuck-in-stage" conditions
                const filteredConditionsData =
                    await filterStuckinStageDataConditions(
                        data,
                        workflow.conditions,
                    );
                const slackTeamID = await getSlackTeamIDByWorkflowID(
                    workflow.id,
                );
                const subDomain = await getSubdomainByWorkflowID(workflow.id);

                const greenhouseUsers = await fetchGreenhouseUsers();
                const slackUsers = await getEmailsfromSlack(slackTeamID);
                const userMapping = await matchUsers(
                    greenhouseUsers,
                    slackUsers,
                );
                // const matchGreenhouseUsers = matc
                // console.log("filteredConditionsData", filteredConditionsData);
                const filteredSlackData = await filterProcessedForSlack(
                    filteredConditionsData,
                    workflow.recipient,
                    slackTeamID,
                );

                if (filteredSlackData.length > 0) {
                    await sendSlackButtonNotification(
                        filteredSlackData,
                        workflow.recipient,
                        slackTeamID,
                        subDomain,
                        userMapping,
                        filteredConditionsData,
                    );
                } else {
                    console.log("No data to send to Slack");
                }
            } else if (workflow.alertType === "create-update") {
                // Logic for "create-update" conditions
            }
            console.log("Workflows processed successfully");
        }

        if (shouldReturnNull) {
            return NextResponse.json(
                { message: "No workflows to process" },
                { status: 200 },
            );
        }

        return NextResponse.json(
            { message: "Workflows processed successfully" },
            { status: 200 },
        );
    } catch (error: unknown) {
        console.error("Failed to process workflows:", error);
        return NextResponse.json(
            {
                error: "Failed to process workflows",
                details: (error as Error).message,
            },
            { status: 500 },
        );
    }
}
