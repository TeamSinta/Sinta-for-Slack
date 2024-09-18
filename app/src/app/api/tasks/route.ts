import { initializeStuckStageChecks } from "@/server/workflowTriggers/stuck-stage";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json();
    // const workflows = await fetchStuckInStageWorkflows();
    await initializeStuckStageChecks(
        body.candidateId,
        body.jobId,
        body.daysToBeStuck,
    );
    return NextResponse.json({}, { status: 200 });
}
