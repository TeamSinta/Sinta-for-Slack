"use server";

import { getOrganizations } from "../actions/organization/queries";
import { getAccessToken } from "../actions/slack/query";

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

        const data = await response.json();
        if (data.ok) {
            return data.channels.map(
                (channel: { id: string; name: string }) => ({
                    value: channel.id,
                    label: `#${channel.name}`,
                }),
            );
        } else {
            throw new Error(data.error || "Error fetching channels");
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

        const data = await response.json();
        if (data.ok) {
            return data.members
                .filter((member) => !member.deleted && member.real_name) // Ensure the user is not deleted and has a real name
                .map((member) => ({
                    value: member.id,
                    label: `@${member.real_name}`, // Using real name with an '@' prefix
                }));
        } else {
            throw new Error(data.error || "Error fetching users");
        }
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}

export async function sendSlackNotification(
    filteredSlackData: any[],
    workflowRecipient: any,
) {
    const { currentOrg = {} } = (await getOrganizations()) || {};
    if (!currentOrg.slack_team_id) {
        console.error("No Slack team ID available.");
        return [];
    }
    const accessToken = await getAccessToken(currentOrg.slack_team_id);

    for (const recipient of workflowRecipient.recipients) {
        const channel = recipient.value; // Extract the channel (Slack ID) from the recipient object

        // Creating attachments instead of using blocks directly
        const blocks = [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: workflowRecipient.openingText, // Ensure this is a string
                    emoji: true,
                },
            },
        ];

        const attachments = [
            {
                color: "#384ab4", // Your desired color
                blocks: [
                    {
                        type: "divider",
                    },
                    ...filteredSlackData.flatMap((data) => [
                        {
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text: workflowRecipient.messageFields
                                    .map((field) => {
                                        const fieldName =
                                            field.charAt(0).toUpperCase() +
                                            field.slice(1).replace(/_/g, " ");
                                        const fieldValue =
                                            data[field] || "Not provided"; // Handle missing data gracefully
                                        return `*${fieldName}*: ${fieldValue}`;
                                    })
                                    .join("\n"),
                            },
                        },
                        ...(workflowRecipient.messageButtons.length > 0
                            ? [
                                  {
                                      type: "actions",
                                      elements:
                                          workflowRecipient.messageButtons.map(
                                              (button) => ({
                                                  type: "button",
                                                  text: {
                                                      type: "plain_text",
                                                      text: button.label,
                                                      emoji: true,
                                                  },
                                                  url: button.action,
                                                  value: "click_me_123",
                                                  action_id: "button_action",
                                              }),
                                          ),
                                  },
                              ]
                            : []),
                    ]),
                    // {
                    //   "type": "actions",
                    //   "block_id": "Sc16L",
                    //   "elements": [
                    //     {
                    //       "type": "button",
                    //       "action_id": "move_to_next_stage_action",
                    //       "text": {
                    //         "type": "plain_text",
                    //         "text": "Move to Next Stage",
                    //         "emoji": true
                    //       },
                    //       "style": "primary",
                    //       "value": "move_to_next_stage",
                    //       "url": "https://app.greenhouse.io"
                    //     },
                    //     {
                    //       "type": "button",
                    //       "action_id": "reject_candidate_action",
                    //       "text": {
                    //         "type": "plain_text",
                    //         "text": "Reject Candidate",
                    //         "emoji": true
                    //       },
                    //       "style": "danger",
                    //       "value": "reject_candidate",
                    //       "url": "https://app.greenhouse.io"
                    //     }
                    //   ]
                    // }
                ],
            },
        ];

        console.log(JSON.stringify(attachments, null, 2)); // Log the attachments structure to debug

        const response = await fetch("https://slack.com/api/chat.postMessage", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                channel: channel,
                attachments: attachments, // Use attachments instead of blocks
                blocks: blocks,
                // text: workflowRecipient.openingText, // Fallback text for notifications
            }),
        });
        console.log(response);
        if (!response.ok) {
            const errorResponse = await response.text(); // Get error details if not OK
            console.error(
                `Failed to post message to channel ${channel}: ${errorResponse}`,
            );
        } else {
            console.log(`Message posted to channel ${channel}`);
        }
    }
}

export async function sendSlackButtonNotification(
    filteredSlackData: any[],
    workflowRecipient: any,
) {
  const { currentOrg = {} } = (await getOrganizations()) || {};
  if (!currentOrg.slack_team_id) {
      console.error("No Slack team ID available.");
      return [];
  }
    const accessToken = await getAccessToken(currentOrg.slack_team_id);

    for (const recipient of workflowRecipient.recipients) {
        const channel = recipient.value; // Extract the channel (Slack ID) from the recipient object

        // Creating attachments instead of using blocks directly
        const blocks = [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: workflowRecipient.openingText, // Ensure this is a string
                    emoji: true,
                },
            },
        ];

        const attachments = [
            {
                color: "#384ab4", // Your desired color
                blocks: [
                    {
                        type: "divider",
                    },
                    ...filteredSlackData.flatMap((data) => [
                        {
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text: workflowRecipient.messageFields
                                    .map((field) => {
                                        const fieldName =
                                            field.charAt(0).toUpperCase() +
                                            field.slice(1).replace(/_/g, " ");
                                        const fieldValue =
                                            data[field] || "Not provided"; // Handle missing data gracefully
                                        return `*${fieldName}*: ${fieldValue}`;
                                    })
                                    .join("\n"),
                            },
                        },
                        // ...(workflowRecipient.messageButtons.length > 0 ? [
                        //     {
                        //         type: "actions",
                        //         elements: workflowRecipient.messageButtons.map(button => ({
                        //             type: "button",
                        //             text: {
                        //                 type: "plain_text",
                        //                 text: button.label,
                        //                 emoji: true,
                        //             },
                        //             url: button.action,
                        //             value: "click_me_123",
                        //             action_id: "button_action"
                        //         }))
                        //     }
                        // ] : []),
                    ]),
                    {
                        type: "actions",
                        block_id: "Sc16L",
                        elements: [
                            {
                                type: "button",
                                action_id: "move_to_next_stage_action",
                                text: {
                                    type: "plain_text",
                                    text: "Move to Next Stage",
                                    emoji: true,
                                },
                                style: "primary",
                                value: "move_to_next_stage",
                                url: "https://app.greenhouse.io",
                            },
                            {
                                type: "button",
                                action_id: "reject_candidate_action",
                                text: {
                                    type: "plain_text",
                                    text: "Reject Candidate",
                                    emoji: true,
                                },
                                style: "danger",
                                value: "reject_candidate",
                                url: "https://app.greenhouse.io",
                            },
                        ],
                    },
                ],
            },
        ];

        console.log(JSON.stringify(attachments, null, 2)); // Log the attachments structure to debug

        const response = await fetch("https://slack.com/api/chat.postMessage", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                channel: channel,
                attachments: attachments, // Use attachments instead of blocks
                blocks: blocks,
                // text: workflowRecipient.openingText, // Fallback text for notifications
            }),
        });
        console.log(response);
        if (!response.ok) {
            const errorResponse = await response.text(); // Get error details if not OK
            console.error(
                `Failed to post message to channel ${channel}: ${errorResponse}`,
            );
        } else {
            console.log(`Message posted to channel ${channel}`);
        }
    }
}
