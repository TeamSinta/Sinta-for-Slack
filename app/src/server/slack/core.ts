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

import { db } from "@/server/db";
import { addGreenhouseSlackValue, matchUsers } from "@/lib/slack";
import { getOrganizations } from "../actions/organization/queries";
import { getAccessToken } from "../actions/slack/query";
import { fetchGreenhouseUsers } from "../greenhouse/core";
import { OpenAI } from "openai";
import { env } from "@/env";
import { combineGreenhouseRolesAndSlackUsers } from "@/app/api/cron/route";
import { and, eq } from "drizzle-orm";
import { membersToOrganizations } from "@/server/db/schema";
import {
    convertHtmlToSlackMrkdwn,
    formatListToString,
    formatToReadableDate,
} from "@/lib/utils";
import { parseCustomMessageBody } from "@/utils/formatting";

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
        const { currentOrg } = (await getOrganizations()) || {};
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
                ...channel,
            }));
        } else {
            throw new Error(data.error ?? "Error fetching channels");
        }
    } catch (error) {
        console.error("Error fetching channels:", error);
        // return [];
        throw new Error(error ?? "Error fetching channels");
    }
}

export async function getActiveUsers(): Promise<
    { value: string; label: string }[]
> {
    try {
        const { currentOrg } = (await getOrganizations()) || {};
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
            console.log("response - status ", response.status);
            console.log("response - status ", response.statusText);
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
            throw new Error("Failed to fetch users", response.statusText);
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
    uploadedFiles: { name: string; id: string }[];
}

export async function sendSlackNotification(
    filteredSlackData: Record<string, unknown>[],
    workflowRecipient: WorkflowRecipient,
    slackTeamID: string,
    subDomain: string,
    candidateDetails: Record<string, unknown>,
    interviewDetails?: Record<string, unknown>,
): Promise<void> {
    const accessToken = await getAccessToken(slackTeamID);
    const allRecipients = workflowRecipient.recipients;

    const customMessageBody = parseCustomMessageBody(
        workflowRecipient.customMessageBody,
        candidateDetails, // Pass candidate details here
        interviewDetails,
    );

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
                                        text: customMessageBody,
                                    },
                                },
                                ...(workflowRecipient.uploadedFiles?.length > 0
                                    ? workflowRecipient.uploadedFiles.map(
                                          (file) => ({
                                              type: "file",
                                              external_id: file.id,
                                              source: "remote",
                                          }),
                                      )
                                    : []),
                                ...(workflowRecipient.messageButtons.length > 0
                                    ? [
                                          {
                                              type: "actions",
                                              block_id: `block_id_${interviewId}`,
                                              elements:
                                                  workflowRecipient.messageButtons.map(
                                                      (button) => {
                                                          const buttonElement: any =
                                                              {
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
                                      ]
                                    : []),
                            ];
                        })
                        .flat(), // Flatten the array of arrays
                ],
            },
            { id: "F07P92F2NMV" },
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

        const data = await response.json();
        // console.log(data);
        // console.log(JSON.stringify(blocks, null, 2)); // This logs the block structure you’re sending
        // console.log("Response Slack message sent:", response.status);
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
    filteredConditionsData,
): Promise<void> {
    console.log(
        "filtered filteredConditionsData dagat-",
        filteredConditionsData,
    );

    const greenhouseUsers = await fetchGreenhouseUsers();
    const slackUsers = await getEmailsfromSlack(slackTeamID);
    const userMapping = await matchUsers(greenhouseUsers, slackUsers);

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
    }
    console.log("total recipients", allRecipients.length);
}

export async function getSlackUserIds(
    hiringroom: { recipient: any[] },
    candidates: any,
    userMapping: any,
) {
    // function buildHiringRoomRecipients(hiringroom, candidates, userMapping){
    hiringroom.recipient.map((recipient: any) => {
        if (recipient.source === "greenhouse") {
            return addGreenhouseSlackValue(recipient, candidates, userMapping);
        }
        return recipient;
    });
    const greenHouseAndSlackRecipients =
        combineGreenhouseRolesAndSlackUsers(hiringroom);
    return greenHouseAndSlackRecipients;
}
export async function getSlackIdsOfGreenHouseUsers(
    hiring_room_recipient: {
        reciepients: string | any[];
        recipients: { source: string; value: string | string[] }[];
    },
    candidate: {
        recruiter: { id: string | number };
        coordinator: { id: string | number };
    },
    userMapping: Record<string, string>,
) {
    const slackIds: string[] = [];
    console.log(
        "hiring reciepieints  -",
        hiring_room_recipient.reciepients.length,
    );
    hiring_room_recipient.recipients.forEach(
        (recipient: { source: string; value: string | string[] }) => {
            if (recipient.source == "greenhouse") {
                if (recipient.value.includes("ecruiter")) {
                    if (candidate.recruiter) {
                        const slackId = userMapping[candidate.recruiter.id];
                        if (slackId) {
                            console.log("entered map");
                            slackIds.push(slackId); //recipient.slackValue = slackId;
                        }
                    }
                } else if (recipient.value.includes("oordinator")) {
                    if (candidate.coordinator) {
                        const slackId = userMapping[candidate.coordinator.id];
                        if (slackId) {
                            slackIds.push(slackId); //recipient.slackValue = slackId;
                        }
                    }
                }
            }
        },
    );
    return slackIds;
}

export async function createSlackChannel(
    channelName: string,
    slackTeamId: string,
): Promise<string | null> {
    const accessToken = await getAccessToken(slackTeamId);

    try {
        console.log(`Creating Slack channel: ${channelName}`);

        const response = await fetch(
            "https://slack.com/api/conversations.create",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    name: channelName,
                }),
            },
        );

        const data = await response.json();

        if (!data.ok) {
            console.error(`Slack API error: ${data.error}`);

            if (data.error === "name_taken") {
                console.warn(
                    "Channel name already taken. Skipping channel creation.",
                );
                return null;
            } else if (data.error === "internal_error") {
                console.warn(
                    "Slack returned an internal error. No further action required.",
                );
                return null; // Gracefully exit without retrying
            } else {
                throw new Error(`Error creating Slack channel: ${data.error}`);
            }
        }

        console.log("Channel created successfully:", data.channel.id);
        return data.channel.id;
    } catch (error) {
        console.error("Error creating Slack channel:", error.message);
        return null; // Return null in case of failure, to handle gracefully downstream
    }
}

export async function inviteUsersToChannel(
    channelId: any,
    userIds: any[],
    slackTeamId: string,
) {
    try {
        console.log("userids - ", userIds);
        console.log("inviteuserstochannel - pre access token");

        const accessToken = await getAccessToken(slackTeamId);
        const response = await fetch(
            "https://slack.com/api/conversations.invite",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    channel: channelId,
                    users: userIds.join(","),
                }),
            },
        );

        const data = await response.json();
        if (!data.ok) {
            throw new Error(`Error inviting users: ${data.error}`);
        }
    } catch (error) {
        console.error("Error inviting users to Slack channel:", error);
    }
}

export async function sendAndPinSlackMessage(
    channelId: string,
    slackTeamID: string,
    messageBlocks: any,
): Promise<void> {
    const accessToken = await getAccessToken(slackTeamID);

    // Post the message to the Slack channel
    const postMessageResponse = await fetch(
        "https://slack.com/api/chat.postMessage",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                channel: channelId,
                blocks: messageBlocks,
            }),
        },
    );

    const postMessageResult = await postMessageResponse.json();
    // console.log(
    //     "sendAndPinSlackMessage - postMessageResult - ",
    //     postMessageResult,
    // );

    if (postMessageResult.ok) {
        const messageTimestamp = postMessageResult.ts;
        console.log(
            `Message posted to channel ${channelId} with timestamp ${messageTimestamp}`,
        );

        // Pin the message
        const pinMessageResponse = await fetch(
            "https://slack.com/api/pins.add",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    channel: channelId,
                    timestamp: messageTimestamp,
                }),
            },
        );

        const pinMessageResult = await pinMessageResponse.json();
        // console.log(
        //     "sendAndPinSlackMessage - pinMessageResult - ",
        //     pinMessageResult,
        // );

        if (!pinMessageResult.ok) {
            console.error(
                `Failed to pin message to channel ${channelId}: ${pinMessageResult.error}`,
            );
        }
    } else {
        console.error(
            `Failed to post message to channel ${channelId}: ${postMessageResult.error}`,
        );
    }
}

const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
});

export async function postWelcomeMessage(channelId, candidateID, slackTeamId) {
    const accessToken = await getAccessToken(slackTeamId);

    try {
        // Post initial welcome message
        const initialMessage = `Welcome to the debrief room for candidate ${candidateID}. Here are the scorecards: ...`;
        await fetch("https://slack.com/api/chat.postMessage", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                channel: channelId,
                text: initialMessage,
            }),
        });

        // Fetch scorecards
        const scorecards = await fetchScorecards(candidateID);

        // Generate the prompt for OpenAI
        const prompt = generatePrompt(scorecards);

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt },
            ],
        });

        console.log("OpenAI response:", response);

        // Extract and clean the JSON from the response
        const responseText = response.choices[0].message.content.trim();
        const jsonStart = responseText.indexOf("{");
        const jsonEnd = responseText.lastIndexOf("}");

        if (jsonStart !== -1 && jsonEnd !== -1) {
            const formattedMessage = JSON.parse(
                responseText.substring(jsonStart, jsonEnd + 1),
            );
            console.log("Formatted message:", formattedMessage);

            // Post the detailed message
            await fetch("https://slack.com/api/chat.postMessage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    channel: channelId,
                    blocks: formattedMessage.blocks,
                }),
            });
        } else {
            throw new Error("No valid JSON found in the response.");
        }
    } catch (error) {
        console.error("Error posting messages:", error);
        throw error;
    }
}

function generatePrompt(scorecards) {
    let prompt = `Generate a Slack message in Block Kit JSON format. The message should include a welcome message, candidate details, and feedback for each interviewer with buttons for actions. Use the following structure and ensure the message is formatted for Slack with dividers and emojis. Do not add any introductory text, explanations, or additional words outside of the JSON format. Only return the JSON response:

  {
      "blocks": [
          {
              "type": "section",
              "text": {
                  "type": "mrkdwn",
                  "text": "Welcome to the debrief room for candidate *{candidate_name}*."
              }
          },
          {
              "type": "section",
              "fields": [
                  {
                      "type": "mrkdwn",
                      "text": "*Position:* {position}"
                  },
                  {
                      "type": "mrkdwn",
                      "text": "*Interview Stage:* {stage}"
                  },
                  {
                      "type": "mrkdwn",
                      "text": "*Date of Application:* {application_date}"
                  },
                  {
                      "type": "mrkdwn",
                      "text": "*Total Interviews Conducted:* {total_interviews}"
                  }
              ]
          },
          {
              "type": "divider"
          },
          {
              "type": "section",
              "text": {
                  "type": "mrkdwn",
                  "text": "Here is a summary of the interview feedback:"
              }
          },
          {interviewer_blocks}
      ]
  }`;

    const interviewer_blocks = scorecards
        .map((scorecard, index) => {
            return `
      {
          "type": "section",
          "text": {
              "type": "mrkdwn",
              "text": "*Interviewer ${index + 1}*:\\n*Overall Recommendation*: ${scorecard.overall_recommendation}\\n\\n:key: *Key Takeaways*:\\n- ${scorecard.key_takeaways}\\n\\n:clipboard: *Interview Attributes*:\\n${scorecard.attributes.map((attr) => `- ${attr}`).join("\\n")}"
          },
          "accessory": {
              "type": "button",
              "action_id": "expand_scorecard_interviewer_${index + 1}",
              "text": {
                  "type": "plain_text",
                  "text": "View Full Scorecard",
                  "emoji": true
              }
          }
      },
      {
          "type": "divider"
      }`;
        })
        .join(",");

    prompt = prompt.replace("{interviewer_blocks}", interviewer_blocks);

    return prompt;
}

async function fetchScorecards(candidateID) {
    // Implement your logic to fetch the scorecards for the given candidateID
    // This is a placeholder function and should be replaced with your actual data fetching logic
    return [
        {
            overall_recommendation: "Strongly recommend",
            key_takeaways:
                "Emphasizes teamwork and connecting the right people to the right opportunities. Handled a technical call by honestly informing the client that he wasn’t the best person for the job and promised to involve the right person in the next call.",
            attributes: [
                "Passionate: Very passionate about his work",
                "Experience: Worked at Miro for over 4 years",
                "Location: Based in Amsterdam",
                "Salary Expectation: Open to a salary between 100-200K",
                "Travel: Willing to travel as he did in his previous job",
            ],
        },
        {
            overall_recommendation: "No scorecard submitted yet",
            key_takeaways: "",
            attributes: [],
        },
        {
            overall_recommendation: "Do not recommend",
            key_takeaways:
                "Good technical knowledge but concerns about time management.",
            attributes: [
                "Experience: Several years in technical roles",
                "Concerns: Poor time management",
                "Final Recommendation: Do not recommend",
            ],
        },
    ];
}

export async function postMessageToChannel(userId: string, body: any) {
    if (!userId) throw new Error("No user id found");
    const { currentOrg } = await getOrganizations();
    const teamId = currentOrg.slack_team_id;
    if (!teamId) throw new Error("No team id found");

    const accessToken = await getAccessToken(teamId);

    const dbUser = await db.query.membersToOrganizations.findFirst({
        where: and(
            eq(membersToOrganizations.memberId, userId),
            eq(membersToOrganizations.organizationId, currentOrg.id),
        ),
    });
    if (!dbUser) throw new Error("No user found");
    const slackUserId = dbUser?.slack_user_id;
    const response = await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            attachments: body.attachments,
            channel: slackUserId,
        }),
    });
    // const resjson = await response.json();
    // console.log("RESPONSE", resjson);
    if (!response.ok) throw new Error("Failed to post message");

    return true;
}

export async function archiveSlackChannel(
    slackChannelID: string,
    slackTeamID: string,
) {
    try {
        // Ensure both slackChannelID, slackTeamID, and accessToken are provided
        if (!slackChannelID || !slackTeamID) {
            throw new Error(
                "Slack channel ID, Slack team ID, or access token is missing.",
            );
        }
        const accessToken = await getAccessToken(slackTeamID);

        // Make the POST request to Slack's API for archiving the channel
        const response = await fetch(
            `https://slack.com/api/conversations.archive`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`, // Bearer token for Slack authentication
                },
                body: JSON.stringify({
                    channel: slackChannelID, // Slack API expects the 'channel' parameter
                }),
            },
        );

        // Check the response to ensure successful archiving
        const responseData = await response.json();
        if (!responseData.ok) {
            throw new Error(
                `Failed to archive Slack channel: ${responseData.error}`,
            );
        }

        console.log(`Slack channel ${slackChannelID} archived successfully.`);
        return;
    } catch (e) {
        console.error("Error archiving Slack channel:", e.message);
    }
}
