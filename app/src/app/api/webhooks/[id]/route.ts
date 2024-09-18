// app/api/webhooks/greenhouse/[orgId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySignature } from '@/lib/utils';
import { getSecretKeyForOrg } from '@/server/actions/greenhouse/query';
import { fetchStuckInStageWorkflows } from '@/server/actions/workflows/queries';

// Webhook handler function for dynamic orgID route
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const orgID = params.id; // Extract the orgId from the URL parameters

  try {
    // 1. Extract the Signature header from the request
    const signature = req.headers.get('Signature');
    console.log(orgID, "orgID")
    const secretKey = await getSecretKeyForOrg(orgID);

    if (!secretKey) {
      return NextResponse.json({ error: 'Organization not found or secret key missing' }, { status: 404 });
    }

    // 3. Read the body of the request
    const body = await req.text(); // We read the body as text for signature verification

    // 4. Verify the webhook signature
    const isVerified = verifySignature(signature, body, secretKey);
    if (!isVerified) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // 5. Parse the body as JSON
    const payload = JSON.parse(body);

    // 6. Call a function to process the webhook (e.g., filter stuck-in-stage workflows)
    await processWebhookEvent(payload, orgID);

    return NextResponse.json({ status: 'Webhook received and processed' }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Error processing webhook' }, { status: 500 });
  }
}

export async function processWebhookEvent(application: any, orgID: string) {
  console.log('Processing webhook event:', application);

  const workflows = await fetchStuckInStageWorkflows(orgID);

  for (const workflow of workflows) {
      const { conditions } = workflow;
      const conditionsMet = checkCandidateAgainstConditions(application, conditions);
      if (conditionsMet) {
          const numberOfDays = extractDaysFromConditions(conditions);
          scheduleCronTask(workflow, application, numberOfDays);
      }
  }

  console.log('Webhook processing complete.');
}

// Function to check if the candidate meets the workflow conditions (pseudo-code for now)
function checkCandidateAgainstConditions(application: any, conditions: any[]): boolean {
  // Iterate through conditions and compare to candidate's application data
  // Example:
  // - Check if candidate is in a specific stage
  // - Check how many days the candidate has been in that stage
  // - Compare to the conditions set in the workflow
  // Return true if all conditions are met, otherwise false

  return false; // Placeholder return value, to be implemented
}

// Function to schedule a task using a cron system (pseudo-code for now)
function scheduleCronTask(workflow: any, application: any, numberOfDays: number) {
  // Integrate with Mergent or another cron system
  // Example:
  // - Schedule a task to notify or remind about the candidate in X number of days
  // - Pass the workflow, application, and days delay to the scheduling system

  console.log(`Scheduling task for workflow "${workflow.name}" in ${numberOfDays} days.`);
}

// Helper function to extract the number of days from the conditions (pseudo-code for now)
function extractDaysFromConditions(conditions: unknown[]): number {
  // Iterate through conditions to find any related to "days stuck in stage"
  // Example:
  // - Parse the days condition field to determine the number of days
  // Return the number of days as a number

  return 0; // Placeholder return value, to be implemented
}
