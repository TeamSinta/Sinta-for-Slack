import {
    fetchCandidateDetails,
    fetchCandidates,
} from "@/server/greenhouse/core";
import { initializeStuckStageChecks } from "@/server/workflowTriggers/stuck-stage";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json();
    await initializeStuckStageChecks(body.candidateId, body.daysToBeStuck);
    return NextResponse.json({}, { status: 200 });
    if (!body.candidateId) {
        return NextResponse.json(
            { message: "Missing required fields" },
            { status: 400 },
        );
    }

    try {
        const candidate = await fetchCandidateDetails(body.candidateId);
        if (!candidate)
            return NextResponse.json(
                { message: "Candidate not found" },
                { status: 404 },
            );

        const candidateStages = candidate.applications.map((item: any) => ({
            id: item.id,
            lastActivity: item?.last_activity_at,
            jobs: item.jobs,
            current_stage: item.current_stage,
        }));
    } catch {
        return NextResponse.json({}, { status: 500 });
    }

    console.log("RECEIVED TASK", body);
    return NextResponse.json(body, { status: 200 });
}
