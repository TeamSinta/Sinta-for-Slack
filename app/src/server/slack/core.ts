/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable  @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

"use server";

import { getOrganizations } from "../actions/organization/queries";
import { getAccessToken } from "../actions/slack/query";

interface SlackChannel {
    id: string;
    name: string;
}

interface SlackUser {
    id: string;
    real_name: string;
    deleted: boolean;
}

interface SlackApiResponse<T> {
    ok: boolean;
    error?: string;
    channels?: T[];
    members?: T[];
}

export async function getChannels(): Promise<
    { value: string; label: string }[]
> {
    try {
        const { currentOrg = {} } = (await getOrganizations()) || {};
        if (!currentOrg.slack_team_id) {
            console.error("No Slack team ID available.");
            return [];
        }

        const accessToken = await getAccessToken(currentOrg.slack_team_id);
        const response = await fetch(
            "https://slack.com/api/conversations.list",
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            throw new Error("Failed to fetch channels");
        }

        const data: SlackApiResponse<SlackChannel> = await response.json();
        if (data.ok && data.channels) {
            return data.channels.map((channel) => ({
                value: channel.id,
                label: `#${channel.name}`,
            }));
        } else {
            throw new Error(data.error ?? "Error fetching channels");
        }
    } catch (error) {
        console.error("Error fetching channels:", error);
        return [];
    }
}

export async function getActiveUsers(): Promise<
    { value: string; label: string }[]
> {
    try {
        const { currentOrg = {} } = (await getOrganizations()) || {};
        if (!currentOrg.slack_team_id) {
            console.error("No Slack team ID available.");
            return [];
        }

        const accessToken = await getAccessToken(currentOrg.slack_team_id);
        const response = await fetch("https://slack.com/api/users.list", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            throw new Error("Failed to fetch users");
        }

        const data: SlackApiResponse<SlackUser> = await response.json();
        if (data.ok && data.members) {
            return data.members
                .filter((member) => !member.deleted && member.real_name)
                .map((member) => ({
                    value: member.id,
                    label: `@${member.real_name}`,
                }));
        } else {
            throw new Error(data.error ?? "Error fetching users");
        }
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}

export async function getEmailsfromSlack(
    teamId?: string,
): Promise<{ value: string; label: string; email: string }[]> {
    try {
        const accessToken = await getAccessToken(teamId);
        const response = await fetch("https://slack.com/api/users.list", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch users");
        }

        const data: SlackApiResponse<SlackUser> = await response.json();

        if (data.ok && data.members) {
            return data.members
                .filter((member) => !member.deleted && member.profile.email)
                .map((member) => ({
                    value: member.id,
                    label: `@${member.real_name}`,
                    email: member.profile.email,
                }));
        } else {
            throw new Error(data.error ?? "Error fetching users");
        }
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}

interface WorkflowRecipient {
    recipients: { value: string }[];
    openingText: string;
    messageFields: string[];
    messageButtons: { label: string; action: string }[];
}

export async function sendSlackNotification(
    filteredSlackData: Record<string, unknown>[],
    workflowRecipient: WorkflowRecipient,
    slackTeamID: string,
    subDomain: string,
): Promise<void> {
    const accessToken = await getAccessToken(slackTeamID);
    const allRecipients = workflowRecipient.recipients;

    for (const recipient of allRecipients) {
        console.log("Recipient:", recipient);
        const channel =
            recipient.source === "greenhouse"
                ? recipient.slackValue
                : recipient.value;

        const blocks = [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: workflowRecipient.openingText,
                    emoji: true,
                },
            },
        ];

        const attachments = [
            {
                color: "#384ab4",
                blocks: [
                    {
                        type: "divider",
                    },
                    ...filteredSlackData
                        .map((data) => {
                            const interviewId = data.interview_id;
                            return [
                                {
                                    type: "section",
                                    text: {
                                        type: "mrkdwn",
                                        text: workflowRecipient.messageFields
                                            .map((field: string) => {
                                                if (field === "interview_id")
                                                    return ""; // Skip interview_id in the message
                                                let fieldName: string;
                                                switch (field) {
                                                    case "title":
                                                        fieldName = "Role";
                                                        break;
                                                    default:
                                                        fieldName =
                                                            field
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                            field
                                                                .slice(1)
                                                                .replace(
                                                                    /_/g,
                                                                    " ",
                                                                );
                                                        break;
                                                }
                                                const fieldValue =
                                                    data[field] ??
                                                    "Not provided";
                                                return `*${fieldName}*: ${String(fieldValue)}`;
                                            })
                                            .filter(Boolean)
                                            .join("\n"),
                                    },
                                },
                                {
                                    type: "section",
                                    text: {
                                        type: "mrkdwn",
                                        text: data.customMessageBody,
                                    },
                                },
                                {
                                    type: "actions",
                                    block_id: `block_id_${interviewId}`,
                                    elements:
                                        workflowRecipient.messageButtons.map(
                                            (button) => {
                                                const buttonElement: any = {
                                                    type: "button",
                                                    text: {
                                                        type: "plain_text",
                                                        text: button.label,
                                                        emoji: true,
                                                    },
                                                    value: `${button.updateType ?? button.type}_${interviewId}`, // Include interviewId in the value
                                                };

                                                if (
                                                    button.type ===
                                                    "UpdateButton"
                                                ) {
                                                    if (
                                                        button.updateType ===
                                                        "MoveToNextStage"
                                                    ) {
                                                        buttonElement.style =
                                                            "primary";
                                                        buttonElement.action_id = `move_to_next_stage_${interviewId}`;
                                                    } else if (
                                                        button.updateType ===
                                                        "RejectCandidate"
                                                    ) {
                                                        buttonElement.style =
                                                            "danger";
                                                        buttonElement.action_id = `reject_candidate_${interviewId}`;
                                                    }
                                                } else if (
                                                    button.linkType ===
                                                    "Dynamic"
                                                ) {
                                                    const baseURL = `https://${subDomain}.greenhouse.io`;
                                                    if (
                                                        button.action ===
                                                        "candidateRecord"
                                                    ) {
                                                        buttonElement.url = `${baseURL}/people/${interviewId}`;
                                                    } else if (
                                                        button.action ===
                                                        "jobRecord"
                                                    ) {
                                                        buttonElement.url = `${baseURL}/sdash/${interviewId}`;
                                                    }
                                                    buttonElement.type =
                                                        "button";
                                                } else {
                                                    buttonElement.action_id =
                                                        button.action ||
                                                        `${button.type.toLowerCase()}_action_${interviewId}`;
                                                }

                                                return buttonElement;
                                            },
                                        ),
                                },
                            ];
                        })
                        .flat(), // Flatten the array of arrays
                ],
            },
        ];

        const response = await fetch("https://slack.com/api/chat.postMessage", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                channel: channel,
                attachments: attachments,
                blocks: blocks,
            }),
        });

        console.log("Response Slack message sent:", response.status);
        if (!response.ok) {
            const errorResponse = await response.text();
            console.error(
                `Failed to post message to channel ${channel}: ${errorResponse}`,
            );
        }
    }
    console.log("Total recipients:", allRecipients.length);
}

export async function sendSlackButtonNotification(
    filteredSlackData: Record<string, unknown>[],
    workflowRecipient: WorkflowRecipient,
    slackTeamID: string,
    subDomain: string, // Adding sub-domain as a parameter
    userMapping: Record<string, string>,
    filteredConditionsData,
): Promise<void> {
    console.log(
        "filtered filteredConditionsData dagat-",
        filteredConditionsData,
    );
    const accessToken = await getAccessToken(slackTeamID);
    const greenhouseRecipients = [];
    let hasGreenhouse = false;
    const greenhouseRoles = [];
    workflowRecipient.recipients.map((rec) => {
        if (rec.source == "greenhouse") {
            hasGreenhouse = true;
            greenhouseRoles.push(rec.value);
        }
    });

    if (hasGreenhouse) {
        const candidates = filteredConditionsData;
        // console.log('filteredConditionsData - ',filteredConditionsData)
        // console.log('candidates - ',candidates)
        candidates.forEach((cand) => {
            greenhouseRoles.forEach((role) => {
                if (role.includes("ecruiter") || role.includes("oordinator")) {
                    if (userMapping[cand.recruiter.id]) {
                        const newRecipient = {
                            value: userMapping[cand.recruiter.id],
                        };
                        greenhouseRecipients.push(newRecipient);
                    } else if (userMapping[cand.coordinator.id]) {
                        const newRecipient = {
                            value: userMapping[cand.coordinator.id],
                        };
                        greenhouseRecipients.push(newRecipient);
                    }
                }
            });
        });
    }
    const allRecipients =
        workflowRecipient.recipients.concat(greenhouseRecipients);
    for (const recipient of allRecipients) {
        console.log("reciepient - ", recipient);
        const channel = recipient.value;

        const blocks = [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: workflowRecipient.openingText,
                    emoji: true,
                },
            },
        ];

        const attachments = [
            {
                color: "#384ab4",
                blocks: [
                    {
                        type: "divider",
                    },
                    ...filteredSlackData
                        .map((data) => {
                            const candidateId = data.candidate_id;
                            return [
                                {
                                    type: "section",
                                    text: {
                                        type: "mrkdwn",
                                        text: workflowRecipient.messageFields
                                            .map((field: string) => {
                                                if (field === "candidate_id")
                                                    return ""; // Skip candidate_id in the message
                                                let fieldName: string;
                                                switch (field) {
                                                    case "name":
                                                        fieldName =
                                                            "Candidate's Name";
                                                        break;
                                                    case "title":
                                                        fieldName = "Role";
                                                        break;
                                                    default:
                                                        fieldName =
                                                            field
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                            field
                                                                .slice(1)
                                                                .replace(
                                                                    /_/g,
                                                                    " ",
                                                                );
                                                        break;
                                                }
                                                const fieldValue =
                                                    data[field] ??
                                                    "Not provided";
                                                return `*${fieldName}*: ${String(fieldValue)}`;
                                            })
                                            .filter(Boolean)
                                            .join("\n"),
                                    },
                                },
                                {
                                    type: "actions",
                                    block_id: `block_id_${candidateId}`,
                                    elements:
                                        workflowRecipient.messageButtons.map(
                                            (button) => {
                                                const buttonElement: any = {
                                                    type: "button",
                                                    text: {
                                                        type: "plain_text",
                                                        text: button.label,
                                                        emoji: true,
                                                    },
                                                    value: `${button.updateType ?? button.type}_${candidateId}`, // Include candidateId in the value
                                                };

                                                if (
                                                    button.type ===
                                                    "UpdateButton"
                                                ) {
                                                    if (
                                                        button.updateType ===
                                                        "MoveToNextStage"
                                                    ) {
                                                        buttonElement.style =
                                                            "primary";
                                                        buttonElement.action_id = `move_to_next_stage_${candidateId}`;
                                                    } else if (
                                                        button.updateType ===
                                                        "RejectCandidate"
                                                    ) {
                                                        buttonElement.style =
                                                            "danger";
                                                        buttonElement.action_id = `reject_candidate_${candidateId}`;
                                                    }
                                                } else if (
                                                    button.linkType ===
                                                    "Dynamic"
                                                ) {
                                                    const baseURL = `https://${subDomain}.greenhouse.io`;
                                                    if (
                                                        button.action ===
                                                        "candidateRecord"
                                                    ) {
                                                        buttonElement.url = `${baseURL}/people/${candidateId}`;
                                                    } else if (
                                                        button.action ===
                                                        "jobRecord"
                                                    ) {
                                                        buttonElement.url = `${baseURL}/sdash/${candidateId}`; // Using candidateId for now as per instructions
                                                    }
                                                    buttonElement.type =
                                                        "button";
                                                } else {
                                                    buttonElement.action_id =
                                                        button.action ||
                                                        `${button.type.toLowerCase()}_action_${candidateId}`;
                                                }

                                                return buttonElement;
                                            },
                                        ),
                                },
                            ];
                        })
                        .flat(), // Flatten the array of arrays
                ],
            },
        ];

        const response = await fetch("https://slack.com/api/chat.postMessage", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                channel: channel,
                attachments: attachments,
                blocks: blocks,
            }),
        });

        console.log("response slack message sent", response.status);
        // console.log("response slack message skip sent sent");
        // function prettyPrint(obj: any, depth = 2) {
        //     return JSON.stringify(
        //         obj,
        //         (key, value) => {
        //             if (
        //                 depth !== 0 &&
        //                 typeof value === "object" &&
        //                 value !== null
        //             ) {
        //                 return value;
        //             }wor
        //             return value;
        //         },
        //         2,
        //     );
        // }

        // console.log("attachments", prettyPrint(attachments));
        // if (!response.ok) {
        //     const errorResponse = await response.text();
        //     console.error(
        //         `Failed to post message to channel ${channel}: ${errorResponse}`,
        //     );
        // }
    }
    console.log("total recipients", allRecipients.length);

    // console.log('total recipients',workflowRecipient.recipients)
    // console.log('total recipients',workflowRecipient.recipients.length)
}
