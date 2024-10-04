// app/api/webhooks/greenhouse/[orgId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifySignature } from "@/lib/utils";
import { getSecretKeyForOrg } from "@/server/actions/greenhouse/query";
import { handleStuckInStageWorkflows } from "./stuckInStage";
import { handleJobCreated } from "./jobCreated";

const eventHandlers: Record<string, any> = {
    candidate_stage_change: [handleStuckInStageWorkflows],
    // interview_deleted: [handleInterviewDeleted],
    job_created: [handleJobCreated],
};

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
        const payload = JSON.parse(body);
        // Application has
        // 6. Call the functions that depend on the webhook (e.g., filter stuck-in-stage workflows)
        const eventType = application.action; // Assuming the event type is provided in the payload
        if (eventHandlers[eventType]) {
            for (const handler of eventHandlers[eventType]) {
                await handler(payload, orgID);
            }
        } else {
            console.warn(`No handlers registered for event type: ${eventType}`);
        }

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
