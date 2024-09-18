import { filterCandidatesDataForSlack } from "@/lib/slack";
import { getSubdomainByWorkflowID } from "@/server/actions/organization/queries";
import { getSlackTeamIDByWorkflowID } from "@/server/actions/slack/query";
import {
    filterStuckinStageDataConditions,
    getCandidateJobApplication,
} from "@/server/greenhouse/core";
import { sendSlackNotification } from "@/server/slack/core";
import { customFetch } from "@/utils/fetch";
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

// Prevent users from being spammed multiple times with the same notification
let prevWorkflowId: string;
let prevCandidateId: string;
let prevJobId: string;
let lastNotifyTime = 0;
const NOTIFICATION_COOLDOWN = 10 * 1000; // 10 second cooldown

export async function POST(request: NextRequest) {
    const body = await request.json();
    // console.log("BODY", body);
    if (!body.workflow || !body.applicationDetails) {
        return NextResponse.json(
            { message: "Missing required fields" },
            { status: 400 },
        );
    }

    const { workflow, applicationDetails } = body;
    if (
        prevWorkflowId === String(workflow.id) &&
        prevCandidateId === String(applicationDetails.candidateId) &&
        prevJobId === String(applicationDetails.jobId)
    ) {
        if (Date.now() - lastNotifyTime < NOTIFICATION_COOLDOWN) {
            return NextResponse.json({}, { status: 200 });
        }
    }

    try {
        // Get the updated candidate Application and compare it to the one in Body
        const currentApplicationState = await getCandidateJobApplication(
            applicationDetails.candidateId,
            applicationDetails.jobId,
        );
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
            const slackTeamID = await getSlackTeamIDByWorkflowID(workflow.id);
            const subDomain = await getSubdomainByWorkflowID(workflow.id);
            const filteredSlackDataWithMessage =
                await filterCandidatesDataForSlack(
                    filteredConditionsData,
                    workflow.recipient,
                    slackTeamID,
                );

            if (filteredSlackDataWithMessage.length > 0) {
                await sendSlackNotification(
                    filteredSlackDataWithMessage,
                    workflow.recipient,
                    slackTeamID,
                    subDomain,
                );
                prevWorkflowId = workflow.id;
                prevCandidateId = applicationDetails.candidateId;
                prevJobId = applicationDetails.jobId;
                lastNotifyTime = Date.now();
            }
        }
    } catch {
        return NextResponse.json({}, { status: 500 });
    }

    return NextResponse.json(body, { status: 200 });
}
