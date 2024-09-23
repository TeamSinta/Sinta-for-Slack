// @ts-nocheck

// app/api/webhooks/greenhouse/[orgId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifySignature } from "@/lib/utils";
import { getSecretKeyForOrg } from "@/server/actions/greenhouse/query";
import { fetchStuckInStageWorkflows } from "@/server/actions/workflows/queries";
import { initializeStuckStageChecks } from "@/server/workflowTriggers/stuck-stage";

// Webhook handler function for dynamic orgID route
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } },
) {
    const orgID = params.id; // Extract the orgId from the URL parameters

    try {
        // 1. Extract the Signature header from the request
        const signature = req.headers.get("Signature");
        const secretKey = await getSecretKeyForOrg(orgID);

        if (!secretKey) {
            return NextResponse.json(
                { error: "Organization not found or secret key missing" },
                { status: 404 },
            );
        }
        // 3. Read the body of the request
        const body = await req.text(); // We read the body as text for signature verification
        // 4. Verify the webhook signature
        const isVerified = verifySignature(signature, body, secretKey);
        if (!isVerified) {
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 400 },
            );
        }
        // 5. Parse the body as JSON
        const application = JSON.parse(body);

        // 6. Call a function to process the webhook (e.g., filter stuck-in-stage workflows)
        await processWebhookEvent(application, orgID);

        return NextResponse.json(
            { status: "Webhook received and processed" },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error processing webhook:", error);
        return NextResponse.json(
            { error: "Error processing webhook" },
            { status: 500 },
        );
    }
}

async function processWebhookEvent(application: any, orgID: string) {

    const workflows = await fetchStuckInStageWorkflows(orgID);

    for (const workflow of workflows) {
        const { conditions } = workflow;

        // Step 1: Check if the candidate is stuck in a stage
        const stuckStageIds = conditions
            .filter((c) => c.condition_type === "Main")
            .map((c) => c.field.value); // Assuming 'value' holds the stage id for comparison

        const isStuck = isStuckInStage(application, stuckStageIds); // Pass payload here
        if (!isStuck) {
            console.log("Candidate is does not match stuck-in-stage workflow.");
            continue;
        }
        // Step 2: Run the secondary condition check
        const secondaryConditions = conditions.filter(
            (c) => c.condition_type === "Add-on",
        );
        const conditionsMet = checkCandidateAgainstConditions(
            application,
            secondaryConditions,
        );
        const applicationExtracted =  application.payload

        if (conditionsMet) {
            const daysToBeStuck = extractDaysFromConditions(conditions);
            await initializeStuckStageChecks(workflow, applicationExtracted, daysToBeStuck);
        } else {
            console.log(
                `Candidate did not meet conditions for workflow "${workflow.name}".`,
            );
        }
    }

    console.log("Webhook processing complete.");
}

function isStuckInStage(application: any, stuckStageIds: string[]): boolean {
    const currentStage = extractCurrentStage(application); // Extract current stage id
    if (!currentStage) {
        return false; // No stage info available
    }
    const currentStageStr = String(currentStage);
    const stuckStageIdsStr = String(stuckStageIds);
    console.log("currentStagestr ",currentStageStr,"currentStage ",stuckStageIds )
    return stuckStageIdsStr.includes(currentStageStr);
}

function extractCurrentStage(application: any): string | null {
    if (
        application &&
        application.payload &&
        application.payload.application &&
        application.payload.application.current_stage &&
        application.payload.application.current_stage.id
    ) {
        return application.payload.application.current_stage.id; // Accessing the stage id
    }
    return null;
}
// Function to check if the candidate meets the workflow conditions
function checkCandidateAgainstConditions(
    application: any,
    conditions: any[],
): boolean {
    // Iterate through all conditions
    for (const condtion of conditions) {
        const { field, condition, value } = condtion;
        const payload = application.payload;
        // Get the candidate's data field using the utility function
        const candidateField = getFieldFromApplication(payload, field);

        // Handle if the field is not found
        if (candidateField === undefined) {
            console.warn(`Field ${field} not found in application.`);
            return false;
        }

        // Compare candidate field with condition's value based on the operator
        switch (condition) {
            case "equals":
                if (candidateField !== value) return false;
                break;
            case "not_equals":
                if (candidateField === value) return false;
                break;
            case "contains":
                if (
                    typeof candidateField === "string" &&
                    !candidateField.includes(value)
                )
                    return false;
                break;
            case "not_contains":
                if (
                    typeof candidateField === "string" &&
                    candidateField.includes(value)
                )
                    return false;
                break;
            case "exactly_matches":
                if (
                    typeof candidateField === "string" &&
                    candidateField !== value
                )
                    return false;
                break;
            case "not_exactly_matches":
                if (
                    typeof candidateField === "string" &&
                    candidateField === value
                )
                    return false;
                break;
            case "starts_with":
                if (
                    typeof candidateField === "string" &&
                    !candidateField.startsWith(value)
                )
                    return false;
                break;
            case "not_starts_with":
                if (
                    typeof candidateField === "string" &&
                    candidateField.startsWith(value)
                )
                    return false;
                break;
            case "ends_with":
                if (
                    typeof candidateField === "string" &&
                    !candidateField.endsWith(value)
                )
                    return false;
                break;
            case "greater_than":
                if (
                    typeof candidateField === "number" &&
                    !(candidateField > value)
                )
                    return false;
                break;
            case "less_than":
                if (
                    typeof candidateField === "number" &&
                    !(candidateField < value)
                )
                    return false;
                break;
            case "after":
                if (new Date(candidateField) <= new Date(value)) return false;
                break;
            case "before":
                if (new Date(candidateField) >= new Date(value)) return false;
                break;
            case "is_true":
                if (!candidateField) return false;
                break;
            case "is_false":
                if (candidateField) return false;
                break;
            case "exists":
                if (candidateField === undefined || candidateField === null)
                    return false;
                break;
            case "does_not_exist":
                if (candidateField !== undefined && candidateField !== null)
                    return false;
                break;
            default:
                console.warn(`Unknown operator: ${condition}`);
                return false;
        }
    }
    // If all conditions are met
    return true;
}

function getFieldFromApplication(application: any, field: string): any {
    // Helper function to traverse object paths
    const traverseObject = (obj: any, path: string): any => {
        const fieldParts = path.split(".");

        let currentValue: any = obj;
        for (const part of fieldParts) {
            if (!currentValue) return null; // If part of the path doesn't exist, return null

            // Handle array indexing if it's in the format field[index]
            const arrayMatch = part.match(/(\w+)\[(\d+)\]/);
            if (arrayMatch) {
                const arrayField = arrayMatch[1]; // The field name before brackets
                const index = parseInt(arrayMatch[2] || "", 10); // The index inside the brackets
                currentValue = currentValue[arrayField]?.[index];
            } else {
                // Normal field lookup
                currentValue = currentValue[part];
            }
        }

        return currentValue;
    };
    // Check `application` level fields first
    const appValue = traverseObject(application.application, field);
    if (appValue !== undefined && appValue !== null) {
        console.log(`Field ${field} found in application`);
        return appValue;
    }
    // Check `candidate` fields
    const candidateValue = traverseObject(
        application.application?.candidate,
        field,
    );
    if (candidateValue !== undefined && candidateValue !== null) {
        console.log(`Field ${field} found in candidate`);
        return candidateValue;
    }
    // Check `jobs` fields (iterate through jobs array)
    if (application.application?.jobs) {
        for (const job of application.application.jobs) {
            const jobValue = traverseObject(job, field);
            if (jobValue !== undefined && jobValue !== null) {
                console.log(`Field ${field} found in jobs`);
                return jobValue;
            }
        }
    }
    // If nothing is found, return null
    console.log(`Field ${field} not found in application, candidate, or jobs.`);
    return null;
}

// Function to schedule a task using a cron system (pseudo-code for now)

function extractDaysFromConditions(conditions: any[]): number {
    // Initialize default value for number of days
    let days = 0;

    // Iterate through the conditions
    for (const condition of conditions) {
        if (condition.conditionType === "main" && condition.unit === "Days") {
            // Parse the value field as a number
            const daysValue = parseInt(condition.value, 10);

            if (!isNaN(daysValue)) {
                days = daysValue;
                break; // Assume there's only one main condition with days
            }
        }
    }

    return days; // Return the number of days found, or 0 if none
}
