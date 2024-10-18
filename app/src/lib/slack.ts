/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/ban-ts-comment */

// @ts-nocheck

import type { NextRequest } from "next/server";
import crypto from "crypto";
import { env } from "@/env";
// import { type Candidate } from "@/types/greenhouse";
import { getEmailsfromSlack } from "@/server/slack/core";
import {
    fetchGreenhouseUsers,
    fetchGreenhouseUser,
} from "@/server/greenhouse/core";
import { getSubdomainByHiringRoomID } from "@/server/actions/hiringrooms/queries";
import { parseCustomMessageBody } from "@/utils/formatting";
import { db } from "@/server/db";
import { greenhouseUsers } from "@/server/db/schema";
import {
    getSlackUserFromGreenhouseId,
    putGreenhouseUserSlackData,
} from "@/server/actions/user/queries";
import { getOrganizations } from "@/server/actions/organization/queries";

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
    attachments?: { name: string; id: string }[];
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
            // console.log('wtf - ',greenhouseUser)
            const email = greenhouseUser.email;
            const slackId = slackUserMap[email];
            // console.log('email - ',email)
            // console.log('slackId - ',slackId)
            if (slackId) {
                userMapping[greenhouseUser.id] = slackId; // Use Greenhouse user ID as the key
            }
        }
    }

    return userMapping;
}

export async function fetchSlackUserFromGreenhouseId(greenhouseId: string) {
    const { currentOrg } = (await getOrganizations()) || {};
    if (!currentOrg.slack_team_id) {
        console.error("No Slack team ID available.");
        return [];
    }

    const accessToken = await getAccessToken(currentOrg.slack_team_id);

    const data = await getSlackUserFromGreenhouseId(greenhouseId);
    console.log("DATA", data);

    // If there is data, we can return it directly, otherwise we need to create it
    if (data?.slackUserId) return data?.slackUserId;

    const greenhouseUser = await fetchGreenhouseUser(greenhouseId);

    if (!greenhouseUser) throw new Error("Greenhouse user not found");
    if (!greenhouseUser.primary_email_address)
        throw new Error("Greenhouse user email not found");

    const response = await fetch(
        "https://slack.com/api/users.lookupByEmail?email=" +
            greenhouseUser.primary_email_address,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                // Authorization: `Bearer xoxe.xoxb-1-MS0yLTY5Nzc3NjAxMDM4OTEtNjk4ODUxNDAyODMyNy03MDAwMTU4MzUzOTQxLTc4OTg2NjQ0OTc5MjItMWNiNTExMmEwZTkzNzNmYTFlMWVmNGFmNjE3ZDg3NDk2MGUxNTY0N2Q4NGQxZWI3NzA1ZmUyZmI0YzhlZDNlNg`,
                "Content-Type": "application/json",
            },
        },
    );

    if (!response.ok) throw new Error("Failed to get slack user");

    const user = await response.json();

    // Store the fetched data to the DB
    const newUserData = {
        organizationId: currentOrg.id,
        // organizationId: "7020aa90-9e7c-4a74-ba36-05808550cf2e",
        greenhouseId,
        email: greenhouseUser.primary_email_address,
        slackUserId: user.user?.id,
        slackLookupAttempted: true,
    };
    await putGreenhouseUserSlackData(newUserData);

    return newUserData.slackUserId;
}

export function addGreenhouseSlackValue(
    recipient: any,
    candidates: any,
    userMapping: any,
) {
    candidates.forEach((candidate: any) => {
        const role = recipient.value as string;
        if (role.includes("ecruiter")) {
            if (candidate.recruiter) {
                const slackId = userMapping[candidate.recruiter.id];
                if (slackId) {
                    recipient.slackValue = slackId;
                } else {
                    recipient.slackValue = "no bucks";
                }
            }
        } else if (role.includes("oordinator")) {
            if (candidate.coordinator) {
                const slackId = userMapping[candidate.coordinator.id];
                if (slackId) {
                    recipient.slackValue = slackId;
                } else {
                    recipient.slackValue = "no bucks coordinator";
                }
            }
        } else {
            // console.log('no role greenhouse')
        }
    });
}
// export async function buildSlackMessageByCandidateOnFilteredData(
//     // export async function filterProcessedForSlack(
//     candidates: Candidate[],
//     workflowMessageFields: any[],
//     // workflow: WorkflowRecipient,
//     // slack_team_id: string,
// ): Promise<Record<string, unknown>[]> {
//     // const greenhouseUsers = await fetchGreenhouseUsers();
//     // console.log("greenhouseruser", greenhouseUsers);
//     // const slackUsers = await getEmailsfromSlack(slack_team_id);
//     // console.log("slackUsers", slackUsers);
//     // const userMapping = await matchUsers(greenhouseUsers, slackUsers);
//     // console.log("workflow", workflow);
//     // console.log("slackUsers", slackUsers);
//     // recipients, greenhouse recipients from greenhouse candidate application, greenhouse users, slack users

//     // const recipientsx = workflow.recipients
//     // recipientsx.forEach((recipientx: any)=>{
//     //     if(recipientx.source == "greenhouse"){
//     //     //find the user
//     //         console.log('go bucks')
//     //         // value == coordinator
//     //         const role = recipientx.value
//     //         if(role.contains("ecruiter")){
//     //             const application =
//     //         } else if(role.contains("oordinator")){

//     //         }
//     //         else{
//     //             console.log('no role greenhouse')
//     //         }
//     //     }
//     // })
//     return candidates.map((candidate) => {
//         const result: Record<string, unknown> = {
//             candidate_id: candidate.id, // Include candidate ID
//             coordinator: candidate.coordinator,
//             recruiter: candidate.recruiter,
//         };
//         // to clarify the "first application" of a candidate, cutting corner because 99%? only have one
//         // const cand_app = candidate.applications[0]

//         // why are we using message fields for this?

//         workflowMessageFields.forEach((field) => {
//             switch (field) {
//                 case "name":
//                     result[field] =
//                         `${candidate.first_name} ${candidate.last_name}`;
//                     break;
//                 case "title":
//                     result[field] = candidate.title ?? "Not provided";
//                     break;
//                 default:
//                     const candidateField = candidate[field as keyof Candidate];
//                     result[field] = getFieldValue(candidateField, field);
//                     break;
//             }
//         });
//         return result;
//     });
// }
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
        // console.log("Interviewers:", interview.interviewers);

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
                        // console.log("Checking interviewer:", int);
                        const slackId = userMapping[int.id];
                        if (slackId) {
                            // console.log("Interviewer Slack ID:", slackId);
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
    if (slackUsers == undefined) {
        return [];
    }
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

export async function formatOpeningMessageSlack(
    hiringRoomData: any,
    title?: string,
    department?: string,
    location?: string,
    employment_type?: string,
    recruiter?: string,
    hiring_managers?: string,
): Promise<any> {
    const subDomain = await getSubdomainByHiringRoomID(hiringRoomData.id);

    const dataLookup = {
        title,
        department,
        location,
        employment_type,
        recruiter,
        hiring_managers,
    };
    const fieldMapping: Record<string, string> = {
        title: "Role",
        department: "Department",
        location: "Location",
        employment_type: "Employment Type",
        recruiter: "Recruiter",
        hiring_manager: "Hiring Manager",
    };

    // Parse and format custom message body using the job data
    const customMessageBody = parseCustomMessageBody(
        hiringRoomData.recipient.customMessageBody,
        dataLookup,
    );

    // Check if message fields are provided in the hiring room data
    const messageFields = hiringRoomData.recipient.messageFields?.map(
        (field: string) => {
            const fieldName =
                fieldMapping[field] ??
                field.charAt(0).toUpperCase() +
                    field.slice(1).replace(/_/g, " ");
            const fieldValue = dataLooukup[field] ?? "Not provided";
            return { fieldName, fieldValue };
        },
    );

    // Group message fields into rows of 2
    const groupedMessageFields = [];
    if (messageFields && messageFields.length > 0) {
        for (let i = 0; i < messageFields.length; i += 2) {
            groupedMessageFields.push(messageFields.slice(i, i + 2));
        }
    }

    // Construct message blocks for Slack
    const messageBlocks: any[] = [
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: customMessageBody,
            },
        },
        {
            type: "divider",
        },
    ];

    // Only add grouped message fields if they exist
    if (groupedMessageFields.length > 0) {
        messageBlocks.push(
            ...groupedMessageFields.map((group) => ({
                type: "section",
                fields: group.map(({ fieldName, fieldValue }) => ({
                    type: "mrkdwn",
                    text: `*${fieldName}*: ${String(fieldValue)}`,
                })),
            })),
        );
    }

    // Add the "Last Modified" section and action buttons
    messageBlocks.push({
        type: "context",
        elements: [
            {
                type: "mrkdwn",
                text: `*Last Modified:* ${new Date().toLocaleString()}`,
            },
        ],
    });
    if (
        hiringRoomData.recipient.messageButtons &&
        hiringRoomData.recipient.messageButtons.length > 0
    ) {
        messageBlocks.push(
            {
                type: "divider",
            },
            {
                type: "actions",
                elements: hiringRoomData.recipient.messageButtons.map(
                    (button: any) => {
                        const buttonElement: any = {
                            type: "button",
                            text: {
                                type: "plain_text",
                                text: button.label || "button",
                                emoji: true,
                            },
                            value: `${button.updateType ?? button.type}`, // Include type in the value
                        };

                        if (button.type === "UpdateButton") {
                            if (button.updateType === "MoveToNextStage") {
                                buttonElement.style = "primary";
                                buttonElement.action_id = `move_to_next_stage`;
                            } else if (
                                button.updateType === "RejectCandidate"
                            ) {
                                buttonElement.style = "danger";
                                buttonElement.action_id = `reject_candidate`;
                            }
                        } else if (button.linkType === "Dynamic") {
                            const baseURL = `https://${subDomain}.greenhouse.io`;
                            if (button.action === "candidateRecord") {
                                buttonElement.url = `${baseURL}/people`;
                            } else if (button.action === "jobRecord") {
                                buttonElement.url = `${baseURL}/sdash`;
                            }
                            buttonElement.type = "button";
                        } else {
                            buttonElement.action_id =
                                button.action ||
                                `${button.type.toLowerCase()}_action`;
                        }

                        return buttonElement;
                    },
                ),
            },
        );
    }
    // console.log("MESSAGE BLOCKS", JSON.stringify(messageBlocks, null, 2));
    return { messageBlocks };
}
