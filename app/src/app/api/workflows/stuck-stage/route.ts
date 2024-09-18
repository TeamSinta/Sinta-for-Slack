import { filterCandidatesDataForSlack } from "@/lib/slack";
import { getSubdomainByWorkflowID } from "@/server/actions/organization/queries";
import { getSlackTeamIDByWorkflowID } from "@/server/actions/slack/query";
import {
    filterStuckinStageDataConditions,
    getCandidateJobApplication,
} from "@/server/greenhouse/core";
import {
    sendSlackButtonNotification,
    sendSlackNotification,
} from "@/server/slack/core";
import { customFetch } from "@/utils/fetch";
import { ConsoleLogWriter } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

interface RequestBody {
    applicationId: number;
    lastActivity: string;
    stageId: number;
    stageName: string;
    candidateId: string;
    jobId: number;
    jobName: string;
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    console.log("BODY", body);
    if (!body.workflow || !body.applicationDetails) {
        return NextResponse.json(
            { message: "Missing required fields" },
            { status: 400 },
        );
    }

    const { workflow, applicationDetails } = body;
    try {
        const currentApplicationState = await getCandidateJobApplication(
            applicationDetails.candidateId,
            applicationDetails.jobId,
        );
        console.log("CURRENT APPLICATION STATE", currentApplicationState);
        if (currentApplicationState.stageId !== applicationDetails.stageId)
            console.log("Application is not stuck! Yay!");
        // Application is stuck! Send a slack notif and then reschedule the task to be run tomorrow
        else {
            const { apiUrl, processor } = body.workflow.triggerConfig;
            const data = await customFetch(
                apiUrl,
                processor ? { query: processor } : {},
            );
            const filteredConditionsData =
                await filterStuckinStageDataConditions(
                    data,
                    workflow.conditions,
                );
            console.log("FILTERED CONDITIONS DATA", filteredConditionsData);
            const slackTeamID = await getSlackTeamIDByWorkflowID(workflow.id);
            const subDomain = await getSubdomainByWorkflowID(workflow.id);
            const filteredSlackDataWithMessage =
                await filterCandidatesDataForSlack(
                    filteredConditionsData,
                    workflow.recipient,
                    slackTeamID,
                );
            console.log(
                "filteredSlackDataWithMessage - ",
                filteredSlackDataWithMessage,
            );
            if (filteredSlackDataWithMessage.length > 0) {
                await sendSlackNotification(
                    filteredSlackDataWithMessage,
                    workflow.recipient,
                    slackTeamID,
                    subDomain,
                );
            }
        }
    } catch {
        return NextResponse.json({}, { status: 500 });
    }

    return NextResponse.json(body, { status: 200 });
}
