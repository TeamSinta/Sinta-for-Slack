/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { getEmailsfromSlack } from "@/server/slack/core";
import { fetchGreenhouseUsers } from "@/server/greenhouse/core";
import { NextResponse } from "next/server";
import { getHiringRooms } from "@/server/actions/hiring_flows/queries";
import { getWorkflows } from "@/server/actions/workflows/queries";
import {
    filterDataWithConditions,
    filterStuckinStageDataConditions,
} from "@/server/greenhouse/core";
import { filterProcessedForSlack, matchUsers } from "@/lib/slack";
import {
    sendSlackButtonNotification,
    sendSlackNotification,
} from "@/server/slack/core";
import { customFetch } from "@/utils/fetch";
import { getSlackTeamIDByWorkflowID } from "@/server/actions/slack/query";

// naming change? why mutation??
function createHiringRoomMutation(){
    
}
// Define the GET handler for the route
export async function handleHiringRooms(){
    const hiring_rooms: HiringRoom[] = await getHiringRooms()
    for (const hiring_room of hiring_rooms) {
        // if conditions met
        if(hiring_room){
            createHiringRoomMutation(hiring_room)
        }
    }

    if (shouldReturnNull) {
        return false
        // return NextResponse.json({ message: "No workflows to process" }, { status: 200 }); 
    }
    return true
    // return NextResponse.json({ message: "Workflows processed successfully" }, { status: 200 });

}
export async function handleWorkflows(){
    const workflows: Workflow[] = await getWorkflows(); // Retrieve workflows from the database
    let shouldReturnNull = false; // Flag to determine whether to return null

    for (const workflow of workflows) {
        if (workflow.alertType === "time-based") {
            const { apiUrl } = workflow.triggerConfig;
            const data = await customFetch(apiUrl); // Fetch data using custom fetch wrapper

            const filteredConditionsData = filterDataWithConditions(
                data,
                workflow.conditions,
            );

            if (filteredConditionsData.length === 0) {
                shouldReturnNull = true; // Set flag to true
            } else {
                const filteredSlackData = filterProcessedForSlack(
                    filteredConditionsData,
                    workflow.recipient,
                );
                await sendSlackNotification(
                    filteredSlackData,
                    workflow.recipient,
                );
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
            const greenhouseUsers = await fetchGreenhouseUsers();
            const slackUsers = await getEmailsfromSlack(slackTeamID);
            const userMapping = await matchUsers(greenhouseUsers, slackUsers);
            // const matchGreenhouseUsers = matc
            // console.log("filteredConditionsData", filteredConditionsData);
            const filteredSlackData = await filterProcessedForSlack(
                filteredConditionsData,
                workflow.recipient,
                slackTeamID,
                greenhouseUsers,
                slackUsers,
                userMapping
            );

            if (filteredSlackData.length > 0) {
                await sendSlackButtonNotification(
                    filteredSlackData,
                    workflow.recipient,
                    slackTeamID,
                    userMapping,
                    filteredConditionsData
                );
                // console.log(filteredSlackData);
                console.log("Sent to Slack");
            } else {
                console.log("No data to send to Slack");
            }
        } else if (workflow.alertType === "create-update") {
            // Logic for "create-update" conditions
        }
        console.log('hereererere')

    }

    if (shouldReturnNull) {
        return false
        // return NextResponse.json({ message: "No workflows to process" }, { status: 200 });
    }
    return true
    // return NextResponse.json({ message: "Workflows processed successfully" }, { status: 200 });

}
export async function GET() {
    try {
        await handleHiringRooms()
        await handleWorkflows()
        return NextResponse.json({ message: "Workflows and Hiring Rooms processed successfully" }, { status: 200 });

        // const workflows: Workflow[] = await getWorkflows(); // Retrieve workflows from the database
        // let shouldReturnNull = false; // Flag to determine whether to return null

        // for (const workflow of workflows) {
        //     if (workflow.alertType === "time-based") {
        //         const { apiUrl } = workflow.triggerConfig;
        //         const data = await customFetch(apiUrl); // Fetch data using custom fetch wrapper

        //         const filteredConditionsData = filterDataWithConditions(
        //             data,
        //             workflow.conditions,
        //         );

        //         if (filteredConditionsData.length === 0) {
        //             shouldReturnNull = true; // Set flag to true
        //         } else {
        //             const filteredSlackData = filterProcessedForSlack(
        //                 filteredConditionsData,
        //                 workflow.recipient,
        //             );
        //             await sendSlackNotification(
        //                 filteredSlackData,
        //                 workflow.recipient,
        //             );
        //         }
        //     } else if (workflow.alertType === "stuck-in-stage") {
        //         const { apiUrl, processor } = workflow.triggerConfig;
        //         const data = await customFetch(
        //             apiUrl,
        //             processor ? { query: processor } : {},
        //         );
        //         console.log("cron-job running!!");
        //         // console.log("cron-job running!! - data ",data);
        //         // Filter data based on the "stuck-in-stage" conditions
        //         const filteredConditionsData =
        //             await filterStuckinStageDataConditions(
        //                 data,
        //                 workflow.conditions,
        //             );
        //         const slackTeamID = await getSlackTeamIDByWorkflowID(
        //             workflow.id,
        //         );
        //         const greenhouseUsers = await fetchGreenhouseUsers();
        //         const slackUsers = await getEmailsfromSlack(slackTeamID);
        //         const userMapping = await matchUsers(greenhouseUsers, slackUsers);
        //         // const matchGreenhouseUsers = matc
        //         // console.log("filteredConditionsData", filteredConditionsData);
        //         const filteredSlackData = await filterProcessedForSlack(
        //             filteredConditionsData,
        //             workflow.recipient,
        //             slackTeamID,
        //             greenhouseUsers,
        //             slackUsers,
        //             userMapping
        //         );

        //         if (filteredSlackData.length > 0) {
        //             await sendSlackButtonNotification(
        //                 filteredSlackData,
        //                 workflow.recipient,
        //                 slackTeamID,
        //                 userMapping,
        //                 filteredConditionsData
        //             );
        //             // console.log(filteredSlackData);
        //             console.log("Sent to Slack");
        //         } else {
        //             console.log("No data to send to Slack");
        //         }
        //     } else if (workflow.alertType === "create-update") {
        //         // Logic for "create-update" conditions
        //     }
        //     console.log('hereererere')

        // }

        // if (shouldReturnNull) {
        //     return NextResponse.json({ message: "No workflows to process" }, { status: 200 });
        // }

        // return NextResponse.json({ message: "Workflows processed successfully" }, { status: 200 });
    } catch (error: unknown) {
        console.error("Failed to process workflows:", error);
        return NextResponse.json({ error: "Failed to process workflows", details: (error as Error).message }, { status: 500 });
    }
}
