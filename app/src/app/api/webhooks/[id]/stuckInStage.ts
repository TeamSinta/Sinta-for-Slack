import { fetchStuckInStageWorkflows } from "@/server/actions/workflows/queries";
import { initializeStuckStageChecks } from "@/server/workflowTriggers/stuck-stage";
import {
    checkCandidateAgainstConditions,
    extractCurrentStage,
    extractDaysFromConditions,
} from "@/utils/workflows";
import { Condition } from "@/types/workflows";

export async function handleStuckInStageWorkflows(
    application: any,
    orgID: string,
) {
    const workflows = await fetchStuckInStageWorkflows(orgID);

    for (const workflow of workflows) {
        const { conditions } = workflow as {
            id: string;
            conditions: Condition[];
        };

        // Step 1: Check if the candidate is stuck in a stage
        const stuckStageIds = conditions
            .filter((c: any) => c.condition_type === "Main")
            .map((c: any) => c.field.value); // Assuming 'value' holds the stage id for comparison

        const isStuck = isStuckInStage(application, stuckStageIds); // Pass payload here
        if (!isStuck) {
            console.log("Candidate is does not match stuck-in-stage workflow.");
            continue;
        }
        // Step 2: Run the secondary condition check
        const secondaryConditions = conditions.filter(
            (c: any) => c.condition_type === "Add-on",
        );
        const conditionsMet = checkCandidateAgainstConditions(
            application,
            secondaryConditions,
        );
        const applicationExtracted = application.payload;

        if (conditionsMet) {
            const daysToBeStuck = extractDaysFromConditions(conditions);
            await initializeStuckStageChecks(
                workflow,
                applicationExtracted,
                daysToBeStuck,
            );
        } else {
            console.log(
                `Candidate did not meet conditions for workflow "${workflow.name}".`,
            );
        }
    }

    console.log("Stuck in Stage Webhook processing complete.");
}

function isStuckInStage(application: any, stuckStageIds: string[]): boolean {
    const currentStage = extractCurrentStage(application); // Extract current stage id
    if (!currentStage) {
        return false; // No stage info available
    }
    const currentStageStr = String(currentStage);
    const stuckStageIdsStr = String(stuckStageIds);
    console.log(
        "currentStagestr ",
        currentStageStr,
        "currentStage ",
        stuckStageIds,
    );
    return stuckStageIdsStr.includes(currentStageStr);
}
