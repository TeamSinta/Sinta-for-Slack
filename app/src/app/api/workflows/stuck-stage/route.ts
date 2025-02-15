import { filterCandidatesDataForSlack } from "@/lib/slack";
import { getSubdomainByWorkflowID } from "@/server/actions/organization/queries";
import { getSlackTeamIDByWorkflowID } from "@/server/actions/slack/query";
import { getCandidateJobApplication } from "@/server/greenhouse/core";
import { sendSlackNotification } from "@/server/slack/core";
import { initializeStuckStageChecks } from "@/server/workflowTriggers/stuck-stage";
import { customFetch } from "@/utils/fetch";
import { NextRequest, NextResponse } from "next/server";

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
//@ts-nocheck
// eslint-disable-next-line @typescript-eslint/ban-ts-comment

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
    // console.log("BODY", body);
    if (!body.workflow || !body.applicationDetails) {
        return NextResponse.json(
            { message: "Missing required fields" },
            { status: 400 },
        );
    }

    const { workflow, applicationDetails } = body;

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
                processor ? { params: processor } : {},
            );
            console.log(currentApplicationState, "CURRENT APPLICATION STATE");
            const slackTeamID = await getSlackTeamIDByWorkflowID(workflow.id);
            const subDomain = await getSubdomainByWorkflowID(workflow.id);
            const filteredSlackDataWithMessage =
                await filterCandidatesDataForSlack(
                    [currentApplicationState.candidateDetails],
                    workflow.recipient,
                    slackTeamID,
                );

            if (filteredSlackDataWithMessage.length > 0) {
                await sendSlackNotification(
                    filteredSlackDataWithMessage,
                    workflow.recipient,
                    slackTeamID,
                    subDomain,
                    currentApplicationState.candidateDetails,
                );

                // Schedule the next event
                await initializeStuckStageChecks(
                    workflow,
                    null,
                    1,
                    applicationDetails,
                );
            }
        }
    } catch (e) {
        console.log("ERROR", e);
        return NextResponse.json({}, { status: 500 });
    }

    return NextResponse.json(body, { status: 200 });
}
