/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import type { NextRequest } from "next/server";
import crypto from "crypto";
import { env } from "@/env";
import { type Candidate } from "@/types/greenhouse";
import { type WorkflowRecipient } from "@/types/workflows";

export async function log(message: string) {
    console.log(message);
    if (!env.VERCEL_SLACK_HOOK) return;
    try {
        return await fetch(env.VERCEL_SLACK_HOOK, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                blocks: [
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: message,
                        },
                    },
                ],
            }),
        });
    } catch (e) {
        if (e instanceof Error) {
            console.error(`Failed to log to Vercel Slack. Error: ${e.message}`);
        } else {
            console.error(`Failed to log to Vercel Slack. Error: ${String(e)}`);
        }
    }
}

export async function verifyRequest(req: NextRequest) {
    const slack_signature = req.headers.get("x-slack-signature") ?? "";
    const timestamp = req.headers.get("x-slack-request-timestamp") ?? "";

    if (!slack_signature || !timestamp) {
        return {
            status: false,
            message:
                "No slack signature or timestamp found in request headers.",
        };
    }
    if (!env.SLACK_SIGNING_SECRET) {
        return {
            status: false,
            message: "`SLACK_SIGNING_SECRET` env var is not defined.",
        };
    }
    if (Math.abs(Math.floor(Date.now() / 1000) - parseInt(timestamp)) > 300) {
        return { status: false, message: "Slack signature mismatch." };
    }

    const body = await req.text(); // Correct way to read the body as text in Next.js
    const req_body = new URLSearchParams(body).toString();
    const sig_basestring = `v0:${timestamp}:${req_body}`;
    const my_signature = `v0=${crypto.createHmac("sha256", env.SLACK_SIGNING_SECRET).update(sig_basestring).digest("hex")}`;

    if (
        slack_signature &&
        crypto.timingSafeEqual(
            Buffer.from(slack_signature),
            Buffer.from(my_signature),
        )
    ) {
        return { status: true, message: "Verified Request." };
    } else {
        return { status: false, message: "Slack signature mismatch." };
    }
}

export function filterProcessedForSlack(
    candidates: Candidate[],
    workflow: WorkflowRecipient,
): Record<string, string>[] {
    return candidates.map((candidate) => {
        const result: Record<string, string> = {};

        workflow.messageFields.forEach((field) => {
            switch (field) {
                case "name":
                    result[field] = `${candidate.first_name} ${candidate.last_name}`;
                    break;
                case "title":
                    result[field] = candidate.title || "Not provided";
                    break;
                case "recruiter_name":
                    result[field] = candidate.recruiter
                        ? candidate.recruiter.name
                        : "No recruiter";
                    break;
                case "coordinator_name":
                    result[field] = candidate.coordinator
                        ? candidate.coordinator.name
                        : "No coordinator";
                    break;
                default:
                    const candidateField = candidate[field as keyof Candidate];
                    result[field] = getFieldValue(candidateField, field);
                    break;
            }
        });

        return result;
    });
}

function getFieldValue(field: unknown, fieldName: string): string {
    if (field === undefined || field === null) {
        return "Not available";
    }
    if (typeof field === "object") {
        return `[Object: ${fieldName}]`; // Provide a better description for objects
    }
    return String(field);
}

// export async function respondToSlack(
//   res: NextApiResponse,
//   response_url: string,
//   teamId: string,
//   feedback?: {
//     keyword?: string;
//     channel?: string;
//   }
// ) {
//   const { keywords, channel, unfurls, notifications } =
//     await getTeamConfigAndStats(teamId); // get the latest state of the bot configurations to make sure it's up to date

//   // respond to Slack with the new state of the bot
//   const response = await fetch(response_url, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       blocks: configureBlocks(
//         keywords,
//         channel,
//         unfurls,
//         notifications,
//         feedback
//       ),
//     }),
//   });
//   return res.status(200).json(response);
// }
