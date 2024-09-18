//@ts-nocheck

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

async function processWebhookEvent(application: any, orgID: string) {
  console.log('Processing webhook event:', application);

  const workflows = await fetchStuckInStageWorkflows(orgID);

  for (const workflow of workflows) {
    const { conditions } = workflow;
    const conditionsMet = checkCandidateAgainstConditions(application, conditions);

    if (conditionsMet) {
      const numberOfDays = extractDaysFromConditions(conditions);
      scheduleCronTask(workflow, application, numberOfDays);
    } else {
      console.log(`Candidate did not meet conditions for workflow "${workflow.name}".`);
    }
  }

  console.log('Webhook processing complete.');
}


// Function to check if the candidate meets the workflow conditions
function checkCandidateAgainstConditions(application: any, conditions: any[]): boolean {
  // Iterate through all conditions
  for (const condition of conditions) {
    const { field, operator, value } = condition;
    // Get the candidate's data field
    const candidateField = application[field];
    // Compare candidate field with condition's value based on the operator
    switch (operator) {
      case 'equals':
        if (candidateField !== value) return false;
        break;
      case 'not_equals':
        if (candidateField === value) return false;
        break;
      case 'contains':
        if (!candidateField.includes(value)) return false;
        break;
      case 'greater_than':
        if (!(candidateField > value)) return false;
        break;
      case 'less_than':
        if (!(candidateField < value)) return false;
        break;
      case 'is_true':
        if (!candidateField) return false;
        break;
      case 'is_false':
        if (candidateField) return false;
        break;
      case 'exists':
        if (candidateField === undefined || candidateField === null) return false;
        break;
      case 'does_not_exist':
        if (candidateField !== undefined && candidateField !== null) return false;
        break;
      default:
        console.warn(`Unknown operator: ${operator}`);
        return false;
    }
  }
  // If all conditions are met
  return true;
}


// Function to schedule a task using a cron system (pseudo-code for now)
function scheduleCronTask(workflow: any, application: any, numberOfDays: number) {
  // Iterate through conditions to find any related to "days stuck in stage"
  // Example:
  // - Parse the days condition field to determine the number of days
  // Return the number of days as a number

  // Integrate with Mergent or another cron system
  // Example:
  // - Schedule a task to notify or remind about the candidate in X number of days
  // - Pass the workflow, application, and days delay to the scheduling system

  console.log(`Scheduling task for workflow "${workflow.name}" in ${numberOfDays} days.`);
}


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
