import { fetchCandidateDetails } from "../greenhouse/core";
import { scheduleTask } from "../mergent";

interface Stage {
    applicationId: number;
    stageId: number;
    stageName: string;
    lastActivity: string;
}

export async function initializeStuckStageChecks(
    candidateId: string,
    daysToBeStuck: number,
) {
    if (!candidateId) throw new Error("Candidate ID not provided");

    const candidate = await fetchCandidateDetails(candidateId);
    if (!candidate) throw new Error("Candidate not found");

    const candidateStages = candidate.applications.map((item: any) => ({
        applicationId: item.id,
        lastActivity: item?.last_activity_at,
        stageId: item.current_stage?.id,
        stageName: item.current_stage?.name,
    }));

    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 5);
    console.log("STUCK STAGE - SCHEDULED DATE: ", scheduledDate);

    scheduleTask(
        // `${process.env.NEXTAUTH_URL}api/workflow/stuck-stage`,
        `${process.env.NEXTAUTH_URL}api/tasks`, // TO TEST THE ENDPOINT (IT JUST LOGS AND RETURNS THE BODY)
        JSON.stringify(candidateStages),
        scheduledDate,
    );
}

export async function stuckStage(
    candidateId: string,
    scheduleEventInXDays: number,
    previousStage?: Stage,
): Promise<any> {
    if (!candidateId) throw new Error("Candidate ID not provided");

    const candidate = await fetchCandidateDetails(candidateId);
    if (!candidate) throw new Error("Candidate not found");

    const candidateStages = candidate.applications.map((item: any) => ({
        applicationId: item.id,
        lastActivity: item?.last_activity_at,
        stageId: item.current_stage?.id,
        stageName: item.current_stage?.name.id,
    }));

    if (
        previousStage &&
        candidateStages.some(
            (stage: Stage) =>
                stage.applicationId === previousStage.applicationId &&
                stage.stageId === previousStage.stageId,
        )
    ) {
    }
}
