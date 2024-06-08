/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import type { NextRequest } from "next/server";
import crypto from "crypto";
import { env } from "@/env";
import { type Candidate } from "@/types/greenhouse";
import { type WorkflowRecipient } from "@/types/workflows";
import { getEmailsfromSlack } from "@/server/slack/core";
import { fetchGreenhouseUsers } from "@/server/greenhouse/core";

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

async function matchUsers(
    greenhouseUsers: Record<string, { id: string; email: string }>,
    slackUsers: { value: string; label: string; email: string }[],
): Promise<Record<string, string>> {
    const slackUserMap = slackUsers.reduce(
        (acc: Record<string, string>, user) => {
            acc[user.email] = user.value; // Map email to Slack user ID
            return acc;
        },
        {},
    );

    const userMapping: Record<string, string> = {};
    for (const greenhouseUserId in greenhouseUsers) {
        const greenhouseUser = greenhouseUsers[greenhouseUserId];
        if (greenhouseUser) {
            const email = greenhouseUser.email;
            const slackId = slackUserMap[email];
            if (slackId) {
                userMapping[greenhouseUser.id] = slackId; // Use Greenhouse user ID as the key
            }
        }
    }
    return userMapping;
}

export async function filterProcessedForSlack(
    candidates: Candidate[],
    workflow: WorkflowRecipient,
): Promise<Record<string, string | number>[]> {
    const greenhouseUsers = await fetchGreenhouseUsers();
    const slackUsers = await getEmailsfromSlack();
    const userMapping = await matchUsers(greenhouseUsers, slackUsers);

    return candidates.map((candidate) => {
        const result: Record<string, string | number> = {
            candidate_id: candidate.id, // Include candidate ID
        };

        workflow.messageFields.forEach((field) => {
            switch (field) {
                case "name":
                    result[field] =
                        `${candidate.first_name} ${candidate.last_name}`;
                    break;
                case "title":
                    result[field] = candidate.title || "Not provided";
                    break;
                case "recruiter_name":
                    if (candidate.recruiter) {
                        const slackId = userMapping[candidate.recruiter.id];
                        result[field] = slackId
                            ? `<@${slackId}>`
                            : candidate.recruiter.name;
                    } else {
                        result[field] = "No recruiter";
                    }
                    break;
                case "coordinator_name":
                    if (candidate.coordinator) {
                        const slackId = userMapping[candidate.coordinator.id];
                        result[field] = slackId
                            ? `<@${slackId}>`
                            : candidate.coordinator.name;
                    } else {
                        result[field] = "No coordinator";
                    }
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
