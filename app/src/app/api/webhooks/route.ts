// app/api/webhooks/greenhouse/route.ts
import { env } from '@/env';
import { verifySignature } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

// Webhook handler function
export async function POST(req: NextRequest) {
  try {
    // 1. Extract the Signature header from the request
    const signature = req.headers.get('Signature');
    const secretKey = env.GREENHOUSE_SECRET_KEY; // Secret key from Greenhouse Webhook config

    // 2. Read the body of the request
    const body = await req.text(); // We read the body as text for signature verification

    // 3. Verify the webhook signature
    const isVerified = verifySignature(signature, body, secretKey);
    if (!isVerified) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // 4. Parse the body as JSON
    const payload = JSON.parse(body);

    // 5. Extract necessary data from the webhook payload (example: candidate and application IDs)

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
