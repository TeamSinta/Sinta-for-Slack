import { getStuckInStageApplicationDetails } from "../greenhouse/core";
import { scheduleTask } from "../mergent";

export async function initializeStuckStageChecks(
    workflow: any,
    application?: any,
    applicationDetails?: any,
    daysToBeStuck: number = 5,
) {
    if (!application && !applicationDetails) {
        throw new Error("No application or application details provided");
    }

    if (!applicationDetails)
        applicationDetails = getStuckInStageApplicationDetails(application);

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
        `StuckinStage-Workflow-${workflow.id}-Application-${applicationDetails.applicationId}`,
    );
}
