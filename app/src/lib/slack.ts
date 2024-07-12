/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/ban-ts-comment */


//@ts-nocheck

import type { NextRequest } from "next/server";
import crypto from "crypto";
import { env } from "@/env";
import { type Candidate } from "@/types/greenhouse";
import { getEmailsfromSlack } from "@/server/slack/core";
import { fetchGreenhouseUsers } from "@/server/greenhouse/core";

// Helper interfaces for better type checking
interface ScheduledInterview {
    id: number;
    application_id: number;
    external_event_id: string;
    start: { date_time: string };
    end: { date_time: string };
    location: string;
    video_conferencing_url: string;
    status: string;
    created_at: string;
    updated_at: string;
    interview: { id: number; name: string };
    organizer: {
        id: number;
        first_name: string;
        last_name: string;
        name: string;
        employee_id: string;
    };
    interviewers: Array<{
        id: number;
        employee_id: string;
        name: string;
        email: string;
        response_status: string;
        scorecard_id: number;
    }>;
}

interface WorkflowRecipient {
    recipients: Array<{
        label: string;
        value: string;
        source: string;
        slackValue?: string;
    }>;
    openingText: string;
    messageFields: Array<string>;
    messageButtons: Array<{
        type: string;
        label: string;
        action: string;
        linkType: string;
    }>;
    messageDelivery: string;
    customMessageBody: string;
}

export async function log(message: string) {
    // console.log(message);
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

export async function matchUsers(
    greenhouseUsers: Record<string, { id: string; email: string }>,
    slackUsers: { value: string; label: string; email: string }[],
): Promise<Record<string, string>> {
    // candidate -> application -> greenhouseUser role -> greenhouse User -> slackUser
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
                console.log("email - in user matching", email);
                userMapping[greenhouseUser.id] = slackId; // Use Greenhouse user ID as the key
            }
        }
    }

    return userMapping;
}

export async function filterProcessedForSlack(
    candidates: Candidate[],
    workflow: WorkflowRecipient,
    slack_team_id: string,
): Promise<Record<string, unknown>[]> {
    const greenhouseUsers = await fetchGreenhouseUsers();
    const slackUsers = await getEmailsfromSlack(slack_team_id);
    const userMapping = await matchUsers(greenhouseUsers, slackUsers);
    // console.log("workflow", workflow);
    // console.log("slackUsers", slackUsers);
    // recipients, greenhouse recipients from greenhouse candidate application, greenhouse users, slack users

    // const recipientsx = workflow.recipients
    // recipientsx.forEach((recipientx: any)=>{
    //     if(recipientx.source == "greenhouse"){
    //     //find the user
    //         console.log('go bucks')
    //         // value == coordinator
    //         const role = recipientx.value
    //         if(role.contains("ecruiter")){
    //             const application =
    //         } else if(role.contains("oordinator")){

    //         }
    //         else{
    //             console.log('no role greenhouse')
    //         }
    //     }
    // })
    return candidates.map((candidate) => {
        const result: Record<string, unknown> = {
            candidate_id: candidate.id, // Include candidate ID
            coordinator: candidate.coordinator,
            recruiter: candidate.recruiter,
        };
        // to clarify the "first application" of a candidate, cutting corner because 99%? only have one
        // const cand_app = candidate.applications[0]

        // why are we using message fields for this?
        workflow.recipients.forEach((recipient: any) => {
            //find the user
            // console.log('recipient - ',recipient.source)
            // console.log('recipient - ',recipient.value)
            // value == coordinator
            if (recipient.source === "greenhouse") {
                const role = recipient.value as string;
                if (role.includes("ecruiter")) {
                    if (candidate.recruiter) {
                        const slackId = userMapping[candidate.recruiter.id];
                        if (slackId) {
                            recipient.slackValue = slackId;
                        } else {
                            console.log(
                                "else map",
                                candidate.recruiter.first_name,
                            );
                            recipient.slackValue = "no bucks";
                        }
                    }
                } else if (role.includes("oordinator")) {
                    if (candidate.coordinator) {
                        const slackId = userMapping[candidate.coordinator.id];
                        if (slackId) {
                            recipient.slackValue = slackId;
                        } else {
                            console.log(
                                "else map",
                                candidate.coordinator.first_name,
                            );
                            recipient.slackValue = "no bucks coordinator";
                        }
                    }
                } else {
                    // console.log('no role greenhouse')
                }
            }
        });
        workflow.messageFields.forEach((field) => {
            switch (field) {
                case "name":
                    result[field] =
                        `${candidate.first_name} ${candidate.last_name}`;
                    break;
                case "title":
                    result[field] = candidate.title ?? "Not provided";
                    break;
                default:
                    const candidateField = candidate[field as keyof Candidate];
                    result[field] = getFieldValue(candidateField, field);
                    break;
            }
        });
        console.log("user mapping  -", userMapping);
        return result;
    });
}
export async function filterScheduledInterviewsDataForSlack(
    scheduledInterviews: ScheduledInterview[],
    workflow: WorkflowRecipient,
    slack_team_id: string,
): Promise<Record<string, unknown>[]> {
    const greenhouseUsers = await fetchGreenhouseUsers();
    const slackUsers = await getEmailsfromSlack(slack_team_id);
    const userMapping = await matchUsers(greenhouseUsers, slackUsers);

    return scheduledInterviews.map((interview) => {
        const result: Record<string, unknown> = {
            interview_id: interview.id,
            application_id: interview.application_id,
            external_event_id: interview.external_event_id,
            start: interview.start.date_time,
            end: interview.end.date_time,
            location: interview.location,
            video_conferencing_url: interview.video_conferencing_url,
            status: interview.status,
            created_at: interview.created_at,
            updated_at: interview.updated_at,
            interview_name: interview.interview.name,
            organizer: interview.organizer.name,
            interviewers: interview.interviewers.map((int) => ({
                id: int.id,
                name: int.name,
                email: int.email,
                response_status: int.response_status,
                scorecard_id: int.scorecard_id,
                slackId: userMapping[int.id] ?? "no match",
            })),
        };

        // Log interviewers to debug
        console.log("Interviewers:", interview.interviewers);

        // Replace placeholders in customMessageBody
        let customMessageBody = workflow.customMessageBody;
        customMessageBody = customMessageBody.replace(
            /{{Interviewer}}/g,
            interview.interviewers.map((int) => int.name).join(", "),
        );
        customMessageBody = customMessageBody.replace(
            /{{Role title}}/g,
            interview.interview.name,
        );
        customMessageBody = customMessageBody.replace(
            /{{Job Stage}}/g,
            interview.interview.name,
        );

        result.customMessageBody = customMessageBody;

        workflow.recipients.forEach((recipient: any) => {
            if (recipient.source === "greenhouse") {
                const role = recipient.value as string;
                if (role.includes("nterviewer")) {
                    interview.interviewers.forEach((int) => {
                        console.log("Checking interviewer:", int);
                        const slackId = userMapping[int.id];
                        if (slackId) {
                            console.log("Interviewer Slack ID:", slackId);
                            recipient.slackValue = slackId;
                        } else {
                            recipient.slackValue = "no match";
                        }
                    });
                } else if (role.includes("ecruiter")) {
                    const slackId = userMapping[interview.organizer.id];
                    if (slackId) {
                        recipient.slackValue = slackId;
                    } else {
                        recipient.slackValue = "no match";
                    }
                }
            }
        });

        workflow.messageFields.forEach((field) => {
            switch (field) {
                case "title":
                    result[field] = interview.interview.name;
                    break;
                case "Recruiter":
                    result[field] = interview.organizer.name;
                    break;
                default:
                    const fieldData =
                        interview[field as keyof ScheduledInterview];
                    result[field] = fieldData ? fieldData : "Not provided";
                    break;
            }
        });

        return result;
    });
}

// Function to filter candidate data for Slack
export async function filterCandidatesDataForSlack(
    candidates: Candidate[],
    workflow: WorkflowRecipient,
    slack_team_id: string,
): Promise<Record<string, unknown>[]> {
    const greenhouseUsers = await fetchGreenhouseUsers();
    const slackUsers = await getEmailsfromSlack(slack_team_id);
    const userMapping = await matchUsers(greenhouseUsers, slackUsers);

    return candidates.map((candidate) => {
        const result: Record<string, unknown> = {
            candidate_id: candidate.id,
            coordinator: candidate.coordinator,
            recruiter: candidate.recruiter,
        };

        // Populate result with message fields
        workflow.messageFields.forEach((field) => {
            switch (field) {
                case "name":
                    result[field] =
                        `${candidate.first_name} ${candidate.last_name}`;
                    break;
                case "title":
                    result[field] = candidate.title ?? "Not provided";
                    break;
                case "company":
                    result[field] = candidate.company ?? "Not provided";
                    break;
                case "email":
                    result[field] = getPrimaryEmail(candidate.email_addresses);
                    break;
                case "phone":
                    result[field] = getPrimaryPhone(candidate.phone_numbers);
                    break;
                case "social_media":
                    result[field] =
                        candidate.social_media_addresses
                            .map((sm) => sm.value)
                            .join(", ") ?? "Not provided";
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

        // Replace placeholders in customMessageBody
        let customMessageBody = workflow.customMessageBody;
        customMessageBody = customMessageBody.replace(
            "{{Recruiter}}",
            candidate.recruiter
                ? userMapping[candidate.recruiter.id]
                    ? `<@${userMapping[candidate.recruiter.id]}>`
                    : `${candidate.recruiter.first_name} ${candidate.recruiter.last_name}`
                : "Recruiter",
        );
        customMessageBody = customMessageBody.replace(
            "{{Candidate_Name}}",
            `${candidate.first_name} ${candidate.last_name}`,
        );
        customMessageBody = customMessageBody.replace(
            "{{Coordinator}}",
            candidate.coordinator
                ? userMapping[candidate.coordinator.id]
                    ? `<@${userMapping[candidate.coordinator.id]}>`
                    : `${candidate.coordinator.first_name} ${candidate.coordinator.last_name}`
                : "Coordinator",
        );

        result.customMessageBody = customMessageBody;

        // Map recipients
        workflow.recipients.forEach((recipient) => {
            if (recipient.source === "greenhouse") {
                const role = recipient.value;
                if (role.includes("Recruiter") && candidate.recruiter) {
                    const slackId = userMapping[candidate.recruiter.id];
                    recipient.slackValue = slackId
                        ? slackId
                        : candidate.recruiter.name;
                } else if (
                    role.includes("Coordinator") &&
                    candidate.coordinator
                ) {
                    const slackId = userMapping[candidate.coordinator.id];
                    recipient.slackValue = slackId
                        ? slackId
                        : candidate.coordinator.name;
                }
            }
        });

        return result;
    });
}

function getFieldValue(field: unknown, fieldName: string): string {
    if (field === undefined ?? field === null) {
        return "Not available";
    }
    if (typeof field === "object") {
        return `[Object: ${fieldName}]`; // Provide a better description for objects
    }
    return String(field);
}

// Function to get the primary email from candidate email addresses
const getPrimaryEmail = (emails: { value: string; type: string }[]): string => {
    const email = emails.find((email) => email.type === "work") ?? emails[0];
    return email ? email.value : "No email";
};

// Function to get the primary phone number from candidate phone numbers
const getPrimaryPhone = (phones: { value: string; type: string }[]): string => {
    const phone = phones.find((phone) => phone.type === "mobile") ?? phones[0];
    return phone ? phone.value : "No phone number";
};
