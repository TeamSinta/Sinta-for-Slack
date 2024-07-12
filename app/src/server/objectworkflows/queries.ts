/* eslint-disable  @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/ban-ts-comment */


/* eslint-disable @typescript-eslint/no-unsafe-argument */

//@ts-nocheck

import {
    filterCandidatesDataForSlack,
    filterScheduledInterviewsDataForSlack,
} from "@/lib/slack";
import {
    filterDataWithConditions,
    filterScheduledInterviewsWithConditions,
} from "../greenhouse/core";
import { sendSlackNotification } from "../slack/core";
import { getSlackTeamIDByWorkflowID } from "../actions/slack/query";
import { getSubdomainByWorkflowID } from "../actions/organization/queries";
import { type WorkflowRecipient } from "@/types/workflows";



interface Workflow {
    id: string;
    alertType: string;
    objectField: string;
    conditions: any; // Replace `any` with the actual type of conditions
    recipient: WorkflowRecipient; // Replace `string` with the actual type of WorkflowRecipient
    triggerConfig: {
        apiUrl: string;
    };
}

export async function processScheduledInterviews(
    data: any[], // Replace `any` with the actual type of data
    workflow: Workflow,
): Promise<any[]> {
    // Replace `any[]` with the actual type of the filtered data
    console.log("processScheduledInterviews  worklow");

    const slackTeamID = await getSlackTeamIDByWorkflowID(workflow.id);
    const subDomain = await getSubdomainByWorkflowID(workflow.id);
    const filteredConditionsData = filterScheduledInterviewsWithConditions(
        data,
        workflow.conditions,
    );

    const filteredSlackData = await filterScheduledInterviewsDataForSlack(
        filteredConditionsData,
        workflow.recipient,
        slackTeamID,
    );

    if (filteredSlackData.length > 0) {
        await sendSlackNotification(
            filteredSlackData,
            workflow.recipient,
            slackTeamID,
            subDomain,
        );
    } else {
        console.log("No data to send to Slack");
    }

    return filteredConditionsData;
}

export async function processCandidates(
    data: any[], // Replace `any` with the actual type of data
    workflow: Workflow,
): Promise<any[]> {
    // Replace `any[]` with the actual type of the filtered data
    console.log("processing Candidates worklow");
    const slackTeamID = await getSlackTeamIDByWorkflowID(workflow.id);
    const subDomain = await getSubdomainByWorkflowID(workflow.id);
    const filteredConditionsData = filterDataWithConditions(
        data,
        workflow.conditions,
    );

    const filteredSlackData = await filterCandidatesDataForSlack(
        filteredConditionsData,
        workflow.recipient,
        slackTeamID,
    );
    console.log("filteredSlackData", filteredSlackData);
    if (filteredSlackData.length > 0) {
        await sendSlackNotification(
            filteredSlackData,
            workflow.recipient,
            slackTeamID,
            subDomain,
        );
    } else {
        console.log("No data to send to Slack");
    }

    return filteredConditionsData;
}
