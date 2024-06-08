/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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

export async function getChannels(): Promise<{ value: string; label: string }[]> {
    try {
        const { currentOrg = {} } = (await getOrganizations()) || {};
        if (!currentOrg.slack_team_id) {
            console.error("No Slack team ID available.");
            return [];
        }

        const accessToken = await getAccessToken(currentOrg.slack_team_id);
        const response = await fetch("https://slack.com/api/conversations.list", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

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

export async function getActiveUsers(): Promise<{ value: string; label: string }[]> {
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

export async function getEmailsfromSlack(teamId?: string): Promise<{ value: string; label: string; email: string }[]> {
  try {
      let slackTeamId = teamId;

      if (!slackTeamId) {
          const { currentOrg = {} } = (await getOrganizations()) || {};
          if (!currentOrg.slack_team_id) {
              console.error("No Slack team ID available.");
              return [];
          }
          slackTeamId = currentOrg.slack_team_id;
      }

      const accessToken = await getAccessToken(slackTeamId);
      console.log(accessToken)
      const response = await fetch("https://slack.com/api/users.list", {
          method: "GET",
          headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
          },
      });
      console.log(response)

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
): Promise<void> {
  const { currentOrg = {} } = (await getOrganizations()) || {};
  if (!currentOrg.slack_team_id) {
      console.error("No Slack team ID available.");
      return;
  }
  const accessToken = await getAccessToken(currentOrg.slack_team_id);

  for (const recipient of workflowRecipient.recipients) {
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
                  ...filteredSlackData.map((data) => {
                      return [
                          {
                              type: "section",
                              text: {
                                  type: "mrkdwn",
                                  text: workflowRecipient.messageFields
                                      .map((field: string) => {
                                          const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " ");
                                          const fieldValue = data[field] ?? "Not provided";
                                          return `*${fieldName}*: ${String(fieldValue)}`;
                                      })
                                      .join("\n"),
                              },
                          },
                          ...(workflowRecipient.messageButtons.length > 0
                              ? [
                                    {
                                        type: "actions",
                                        elements: workflowRecipient.messageButtons.map((button) => ({
                                            type: "button",
                                            text: {
                                                type: "plain_text",
                                                text: button.label,
                                                emoji: true,
                                            },
                                            url: button.action,
                                            value: "click_me_123",
                                            action_id: "button_action",
                                        })),
                                    },
                                ]
                              : []),
                      ];
                  }).flat(), // Flatten the array of arrays
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

      if (!response.ok) {
          const errorResponse = await response.text();
          console.error(`Failed to post message to channel ${channel}: ${errorResponse}`);
      } else {
          console.log(`Message posted to channel ${channel}`);
      }
  }
}


export async function sendSlackButtonNotification(
  filteredSlackData: Record<string, unknown>[],
  workflowRecipient: WorkflowRecipient,
): Promise<void> {
  const { currentOrg = {} } = (await getOrganizations()) || {};
  if (!currentOrg.slack_team_id) {
    console.error("No Slack team ID available.");
    return;
  }
  const accessToken = await getAccessToken(currentOrg.slack_team_id);

  for (const recipient of workflowRecipient.recipients) {
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
          ...filteredSlackData.map((data) => {
            const candidateId = data['candidate_id'];
            return [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: workflowRecipient.messageFields
                    .map((field: string) => {
                      if (field === "candidate_id") return ''; // Skip candidate_id in the message
                      let fieldName: string;
                      switch (field) {
                        case "name":
                          fieldName = "Candidate's Name";
                          break;
                        case "title":
                          fieldName = "Role";
                          break;
                        default:
                          fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " ");
                          break;
                      }
                      const fieldValue = data[field] ?? "Not provided";
                      return `*${fieldName}*: ${String(fieldValue)}`;
                    })
                    .filter(Boolean)
                    .join("\n"),
                },
              },
              {
                type: "actions",
                block_id: "Sc16L",
                elements: workflowRecipient.messageButtons.map((button) => {
                  const buttonElement: any = {
                    type: "button",
                    text: {
                      type: "plain_text",
                      text: button.label,
                      emoji: true,
                    },
                    value: `${button.updateType || button.type}_${candidateId}`, // Include candidateId in the value
                  };

                  if (button.type === "UpdateButton") {
                    if (button.updateType === "MoveToNextStage") {
                      buttonElement.style = "primary";
                      buttonElement.action_id = `move_to_next_stage_${candidateId}`;
                    } else if (button.updateType === "RejectCandidate") {
                      buttonElement.style = "danger";
                      buttonElement.action_id = `reject_candidate_${candidateId}`;
                    }
                  } else {
                    buttonElement.action_id = button.action || `${button.type.toLowerCase()}_action_${candidateId}`;
                  }

                  return buttonElement;
                }),
              },
            ];
          }).flat(), // Flatten the array of arrays
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

    console.log(JSON.stringify(attachments, null, 2));
  }
}
