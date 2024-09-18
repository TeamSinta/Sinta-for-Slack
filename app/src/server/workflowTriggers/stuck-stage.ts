import {
    fetchCandidateDetails,
    getStuckInStageApplicationDetails,
} from "../greenhouse/core";
import { scheduleTask } from "../mergent";

interface Stage {
    applicationId: number;
    stageId: number;
    stageName: string;
    lastActivity: string;
}

export async function scheduleStuckStageChecksTask(
    workflow: any,
    application: any,
    numberOfDays: number,
) {}

export async function initializeStuckStageChecks(
    workflow: any,
    application: any,
    daysToBeStuck: number = 5,
) {
    const applicationDetails = getStuckInStageApplicationDetails(application);

    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + daysToBeStuck);
    console.log(
        "Scheduling a task to check if the candidate is stuck to be run at ",
        scheduledDate,
    );

    // The schedules the task to be run in the next 5 days
    scheduleTask(
        `${process.env.NEXTAUTH_URL}api/workflows/stuck-stage`,
        JSON.stringify({ applicationDetails, workflow }),
        scheduledDate,
    );
}
