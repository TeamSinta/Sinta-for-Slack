// app/api/webhooks/greenhouse/[orgId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySignature } from '@/lib/utils';
import { getSecretKeyForOrg } from '@/server/actions/greenhouse/query';

// Webhook handler function for dynamic orgID route
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const orgID = params.id; // Extract the orgId from the URL parameters

  try {
    // 1. Extract the Signature header from the request
    const signature = req.headers.get('Signature');
    console.log(orgID, "orgID")
    // 2. Fetch the secret key for the organization using orgID
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
    await processWebhookEvent(payload);

    return NextResponse.json({ status: 'Webhook received and processed' }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Error processing webhook' }, { status: 500 });
  }
}



// utils/processWebhookEvent.ts

export async function processWebhookEvent(application: any) {
 console.log('Processing webhook event:', application);


}
