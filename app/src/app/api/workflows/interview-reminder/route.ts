import { filterCandidatesDataForSlack } from "@/lib/slack";
import { getSubdomainByWorkflowID } from "@/server/actions/organization/queries";
import { getSlackTeamIDByWorkflowID } from "@/server/actions/slack/query";
import {
    fetchApplicationDetails,
    fetchCandidateDetails,
    getCandidateJobApplication,
} from "@/server/greenhouse/core";
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
    if (!body.workflow || !body.interview) {
        return NextResponse.json(
            { message: "Missing required fields" },
            { status: 400 },
        );
    }

    const { workflow, interview } = body;
    if (!interview.application_id)
        return NextResponse.json({}, { status: 404 });
    try {
        // Do I need to check if the interview is still scheduled?
        // If so, we have to do another API call to get the most recent interview details

        // Just send the interview reminder!
        const application = await fetchApplicationDetails(
            interview.application_id,
        );
        // console.log("APPLICATION", JSON.stringify(application, null, 2));

        const candidate = await fetchCandidateDetails(application.candidate_id);
        // console.log("CANDIDATE", JSON.stringify(candidate, null, 2));

        const slackTeamID = await getSlackTeamIDByWorkflowID(workflow.id);
        const subDomain = await getSubdomainByWorkflowID(workflow.id);
        const filteredSlackDataWithMessage = await filterCandidatesDataForSlack(
            [candidate],
            workflow.recipient,
            slackTeamID,
        );

        if (filteredSlackDataWithMessage.length > 0) {
            await sendSlackNotification(
                filteredSlackDataWithMessage,
                workflow.recipient,
                slackTeamID,
                subDomain,
                candidate,
            );
        }
    } catch (e) {
        console.log("ERROR", e);
        return NextResponse.json({}, { status: 500 });
    }

    return NextResponse.json(body, { status: 200 });
}
