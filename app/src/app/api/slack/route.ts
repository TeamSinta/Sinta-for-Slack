/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// src/pages/api/slack/oauth.ts
import { db } from "@/server/db";
import { and, eq } from "drizzle-orm";
import { slackChannelsCreated } from "@/server/db/schema"; // Assuming HiringroomStatus is the enum type for status

import type { NextRequest } from "next/server"; // Only used as a type
import { NextResponse } from "next/server";
import { getAccessToken, setAccessToken } from "@/server/actions/slack/query";

import { siteUrls } from "@/config/urls";
import {
    fetchActiveCandidates,
    fetchCandidateDetails,
    fetchEmailTemplates,
    fetchGreenhouseUsers,
    fetchRejectReasons,
    fetchStagesForJob,
    getAllCandidates,
    matchSlackToGreenhouseUsers,
    moveToNextStageInGreenhouse,
} from "@/server/greenhouse/core";
import {
    createSlackChannel,
    getEmailsfromSlack,
    inviteUsersToChannel,
    postWelcomeMessage,
} from "@/server/slack/core";

// Define the type for the response from Slack's OAuth endpoint
interface SlackInteraction {
    type: string;
    actions: SlackAction[];
    trigger_id: string;
    team: { id: string };
    message?: {
        blocks: any[];
        attachments: any[];
    };
    response_url: string;
    view?: {
        state: any;
        private_metadata: string;
    };
}

// Define the type for a Slack action
interface SlackAction {
    action_id: string;
    value?: string;
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
        return new NextResponse(
            JSON.stringify({ message: "Code parameter is missing." }),
            { status: 400 },
        );
    }

    const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;
    const redirectUri = process.env.NEXTAUTH_URL + "api/slack";

    // console.log('json secret - ',json)
    if (!clientId || !clientSecret) {
        return new NextResponse(
            JSON.stringify({
                message: "Slack client ID or secret is undefined.",
            }),
            { status: 500 },
        );
    }

    try {
        const url = `https://slack.com/api/oauth.v2.access?client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
        console.log("url - ", url);
        const response = await fetch(url, { method: "POST" });
        const json = await response.json();
        if (
            json.access_token &&
            json.refresh_token &&
            json.expires_in &&
            json.team?.id
        ) {
            // Calculate the expiry timestamp
            const expiresAt = Math.floor(Date.now() / 1000) + json.expires_in;

            // Store access token, refresh token, and expiry time securely
            const updateResponse = await setAccessToken(
                json.access_token,
                json.team.id,
                json.refresh_token,
                expiresAt,
            );
            console.log("Access token updated:", updateResponse);
            console.log(json);
            if (updateResponse === "OK") {
                const url = `${siteUrls.publicUrl}/success/${json.team.id}`;
                return NextResponse.redirect(url);
            } else {
                return new NextResponse(
                    JSON.stringify({
                        message: "Failed to update access token.",
                    }),
                    { status: 500 },
                );
            }
        } else {
            return new NextResponse(
                JSON.stringify({
                    message:
                        "No access token, refresh token, or team id found in response from Slack's OAuth.",
                }),
                { status: 500 },
            );
        }
    } catch (err) {
        console.error(err);
        return new NextResponse(
            JSON.stringify({ message: "An unknown error occurred." }),
            { status: 500 },
        );
    }
}

async function handleJsonPost(_data: JSON) {
    return new NextResponse(
        JSON.stringify({ message: "JSON POST handled successfully" }),
        {
            status: 200,
            headers: { "Content-Type": "application/json" },
        },
    );
}

async function updateSlackMessage(
    responseUrl: string,
    blocks: any,
    attachments: any,
) {
    try {
        if (!responseUrl) {
            throw new Error("Invalid response URL.");
        }

        const response = await fetch(responseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                replace_original: true,
                blocks: blocks,
                attachments: attachments,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to update Slack message.");
        }

        console.log("Slack message updated successfully.");
    } catch (error) {
        console.error("Error updating Slack message:", error);
    }
}

async function fetchCandidateData(view_id, accessToken) {
    const candidates = await fetchActiveCandidates(); // Fetch active candidates

    const updatePayload = {
        view_id: view_id,
        view: {
            type: "modal",
            callback_id: "debrief_modal",
            title: {
                type: "plain_text",
                text: "Create Debrief",
            },
            blocks: [
                {
                    type: "input",
                    block_id: "name_block",
                    element: {
                        type: "plain_text_input",
                        action_id: "name_input",
                        placeholder: {
                            type: "plain_text",
                            text: "Enter debrief name (optional)",
                        },
                    },
                    label: {
                        type: "plain_text",
                        text: "Name",
                    },
                    optional: true,
                },
                {
                    type: "input",
                    block_id: "candidate_block",
                    element: {
                        type: "static_select",
                        action_id: "candidate_input",
                        placeholder: {
                            type: "plain_text",
                            text: "Select a candidate",
                        },
                        options: candidates.map((candidate) => ({
                            text: {
                                type: "plain_text",
                                text: `${candidate.name} - *Stage:* ${candidate.stage} / *Job:* ${candidate.job}`,
                            },
                            value: candidate.id.toString(),
                        })),
                    },
                    label: {
                        type: "plain_text",
                        text: "Candidate",
                    },
                },
                {
                    type: "input",
                    block_id: "recipients_block",
                    element: {
                        type: "multi_users_select",
                        action_id: "recipients_input",
                        placeholder: {
                            type: "plain_text",
                            text: "Select recipients",
                        },
                    },
                    label: {
                        type: "plain_text",
                        text: "Recipients/Debrief Team",
                    },
                },
            ],
            submit: {
                type: "plain_text",
                text: "Create",
            },
            close: {
                type: "plain_text",
                text: "Cancel",
            },
        },
    };

    return updateModal(updatePayload, accessToken); // Update the modal with the new candidate options
}
async function handleMoveToNextStageSubmission(payload: SlackInteraction) {
    try {
        const { view, user, team } = payload;

        // Decode private_metadata
        const { response_url, message_blocks, attachments, candidate_id } =
            JSON.parse(view.private_metadata);

        const selectedStageId =
            view.state.values.stage_select_block.stage_select.selected_option
                .value;

        // Acknowledge the modal submission to close the modal
        const acknowledgmentResponse = NextResponse.json({}, { status: 200 });

        // Fetch Slack users based on the team ID from the payload
        const slackUsers = await getEmailsfromSlack(team.id);

        // Match Slack user to Greenhouse user
        const greenhouseUsers = await fetchGreenhouseUsers();
        const userMapping = await matchSlackToGreenhouseUsers(
            greenhouseUsers,
            slackUsers
        );
        const greenhouseUserId = userMapping[user.id];

        let statusMessage = "";
        let emoji = "✅";
        if (!greenhouseUserId) {
            statusMessage =
                "Incorrect permissions. Failed to find corresponding Greenhouse user for the Slack user.";
            emoji = "❌";
        } else {
            const result = await moveToNextStageInGreenhouse(
                candidate_id,
                selectedStageId,
                greenhouseUserId,
            );
            if (result.success) {
                statusMessage =
                    "Candidate moved to the next stage successfully.";
            } else {
                statusMessage = `Failed to move candidate to the next stage: ${result.error}.`;
                emoji = "❌";
            }
        }

        // Add the new text message as a context block below the text and above the action buttons
        const contextBlock = {
            type: "context",
            elements: [
                {
                    type: "mrkdwn",
                    text: `${emoji} ${statusMessage}`,
                },
            ],
        };

        // Find the index of the first actions block
        const actionBlockIndex = attachments[0].blocks.findIndex(
            (block: any) => block.type === "actions",
        );

        if (actionBlockIndex !== -1) {
            // Insert the context block before the actions block
            attachments[0].blocks.splice(actionBlockIndex, 0, contextBlock);
        } else {
            // Add the context block to the end if no actions block is found
            attachments[0].blocks.push(contextBlock);
        }

        await updateSlackMessage(response_url, message_blocks, attachments);

        return acknowledgmentResponse;
    } catch (error) {
        console.error("Error handling submission:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
async function handleDebriefSubmission(payload) {
    const { team, user, view } = payload;
    const values = view.state.values;

    console.log("debrief submission", values);

    const candidateBlock = values.candidate_block.candidate_input;
    const nameInput = values.name_block.name_input.value;
    const recipients = values.recipients_block.recipients_input.selected_users;

    if (!candidateBlock || !candidateBlock.selected_option) {
        await updateModalWithError(
            view.id,
            view.hash,
            accessToken,
            "Please select a valid candidate",
        );
        return new NextResponse(
            JSON.stringify({ error: "Please select a valid candidate" }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" },
            },
        );
    }

    const candidateID = candidateBlock.selected_option.value; // Get candidateID
    const candidateText = candidateBlock.selected_option.text.text; // Get candidate text
    const candidateName = candidateText.split(" - ")[0].trim(); // Extract the candidate name

    const slackTeamId = team.id;

    // Generate the channel name
    const channelName = nameInput
        ? `debrief-${nameInput.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase()}`
        : `debrief-${candidateName.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase()}-${new Date()
              .toISOString()
              .split("T")[0]
              .replace(/[^a-zA-Z0-9-]/g, "")
              .toLowerCase()}`;

    // Continue with creating the Slack channel and inviting users if no errors
    try {
        const channelId = await createSlackChannel(channelName, slackTeamId);

        await inviteUsersToChannel(channelId, recipients, slackTeamId);
        const responseToSlack = new NextResponse(
            JSON.stringify({ response_action: "clear" }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            },
        );
        await postWelcomeMessage(channelId, candidateID, slackTeamId);

        return responseToSlack;
    } catch (error) {
        console.error(error);
        return new NextResponse(
            JSON.stringify({ error: "Failed to create debrief room" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
}

// Function to handle Slack interactions
async function handleSlackInteraction(payload: SlackInteraction) {
    const { type, actions, trigger_id, team, response_url, message } = payload;
    if (type === "block_actions") {
        const action = actions[0];
        if (!action?.value) {
            console.error("No value found in the action");
            return new NextResponse(
                JSON.stringify({ error: "No value found in the action" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }
        if (action.value.startsWith("LinkButton_")) {
            return handleJsonPost({ message: "Link button clicked" });
        }

        const { action_id } = action;
        console.log('handle slack interaction - pre access token')

        const accessToken = await getAccessToken(team.id);

        // Parse candidate ID from action_id
        const candidateIdMatch = action_id.match(/_(\d+)$/);
        const candidateId = candidateIdMatch ? candidateIdMatch[1] : null;

        if (action_id.startsWith("move_to_next_stage_")) {
            // Encode necessary information in private_metadata
            const privateMetadata = JSON.stringify({
                response_url,
                message_blocks: message.blocks,
                attachments: message.attachments,
                candidate_id: candidateId,
            });

            const modalPayload = await createMoveToNextStageModal(
                trigger_id,
                candidateId,
                privateMetadata,
            );
            return openModal(modalPayload, accessToken);
        } else if (action_id.startsWith("reject_candidate_")) {
            // Encode necessary information in private_metadata
            const privateMetadata = JSON.stringify({
                response_url,
                message_blocks: message.blocks,
                attachments: message.attachments,
                candidate_id: candidateId,
            });

            const modalPayload = await createRejectCandidateModal(
                trigger_id,
                candidateId,
                privateMetadata,
            );
            return openModal(modalPayload, accessToken);
        }
    } else if (type === "view_submission") {
        if (payload.view.callback_id === "submit_move_to_next_stage") {
            return handleMoveToNextStageSubmission(payload);
        } else if (payload.view.callback_id === "submit_reject_candidate") {
            return handleRejectCandidateSubmission(payload);
        } else if (payload.view.callback_id === "debrief_modal") {
            return handleDebriefSubmission(payload);
        }
    }

    return new NextResponse(
        JSON.stringify({ error: "Unhandled interaction type" }),
        {
            status: 400,
            headers: { "Content-Type": "application/json" },
        },
    );
}

// Function to open a modal in response to a button click
async function openModal(modalPayload, accessToken) {
    const response = await fetch("https://slack.com/api/views.open", {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(modalPayload),
    });

    const data = await response.json();

    if (response.ok) {
        return { status: 200, view_id: data.view.id };
    } else {
        return new NextResponse(
            JSON.stringify({ error: "Failed to open modal" }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
}

async function updateModal(updatePayload, accessToken) {
    const response = await fetch("https://slack.com/api/views.update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updatePayload),
    });

    const data = await response.json();

    console.log("update modal response", data);

    if (!response.ok) {
        console.error("Failed to update modal", await response.json());
        return new NextResponse(
            JSON.stringify({ error: "Failed to update modal" }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
}

async function createMoveToNextStageModal(
    trigger_id: string,
    candidateId: string,
    privateMetadata: string,
) {
    try {
        // Fetch candidate details to get the job ID
        const candidateDetails = await fetchCandidateDetails(candidateId);

        // Extract Job ID from candidate details
        let jobId;
        if (
            candidateDetails.applications &&
            candidateDetails.applications.length > 0
        ) {
            const application = candidateDetails.applications[0];
            if (application.jobs && application.jobs.length > 0) {
                jobId = application.jobs[0].id;
            } else {
                throw new Error("Job ID not found in the application");
            }
        } else {
            throw new Error("No applications found for the candidate");
        }

        // Fetch stages for the job
        const stages = await fetchStagesForJob(jobId);

        // Create and return the modal payload
        return {
            trigger_id: trigger_id,
            view: {
                type: "modal",
                callback_id: "submit_move_to_next_stage",
                private_metadata: privateMetadata, // Store candidate ID and other info in private metadata
                title: {
                    type: "plain_text",
                    text: "Move to Next Stage",
                    emoji: true,
                },
                submit: {
                    type: "plain_text",
                    text: "Submit",
                    emoji: true,
                },
                close: {
                    type: "plain_text",
                    text: "Cancel",
                    emoji: true,
                },
                blocks: [
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: "Select the next stage for this candidate:",
                        },
                    },
                    {
                        type: "input",
                        block_id: "stage_select_block",
                        label: {
                            type: "plain_text",
                            text: "Stage",
                            emoji: true,
                        },
                        element: {
                            type: "static_select",
                            placeholder: {
                                type: "plain_text",
                                text: "Select stage",
                                emoji: true,
                            },
                            options: stages.map((stage) => ({
                                text: {
                                    type: "plain_text",
                                    text: stage.name,
                                    emoji: true,
                                },
                                value: stage.id.toString(),
                            })),
                            action_id: "stage_select",
                        },
                    },
                ],
            },
        };
    } catch (error) {
        console.error("Error creating move to next stage modal:", error);
        throw error; // Ensure the error is handled by the caller
    }
}

async function createRejectCandidateModal(
    trigger_id: string,
    _candidateId: string,
    privateMetadata: string,
) {
    try {
        // Fetch reject reasons and email templates
        const rejectReasons = await fetchRejectReasons();
        const emailTemplates = await fetchEmailTemplates();

        // Create and return the modal payload
        return {
            trigger_id: trigger_id,
            view: {
                type: "modal",
                callback_id: "submit_reject_candidate",
                private_metadata: privateMetadata, // Store candidate ID in private metadata
                title: {
                    type: "plain_text",
                    text: "Reject Candidate",
                    emoji: true,
                },
                submit: {
                    type: "plain_text",
                    text: "Submit",
                    emoji: true,
                },
                close: {
                    type: "plain_text",
                    text: "Cancel",
                    emoji: true,
                },
                blocks: [
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: "Select a reason for rejecting this candidate:",
                        },
                    },
                    {
                        type: "input",
                        block_id: "reject_reason_select_block",
                        label: {
                            type: "plain_text",
                            text: "Reason",
                            emoji: true,
                        },
                        element: {
                            type: "static_select",
                            placeholder: {
                                type: "plain_text",
                                text: "Select reason",
                                emoji: true,
                            },
                            options: rejectReasons.map((reason) => ({
                                text: {
                                    type: "plain_text",
                                    text: reason.name,
                                    emoji: true,
                                },
                                value: reason.id.toString(),
                            })),
                            action_id: "reject_reason_select",
                        },
                    },
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: "Select an email template to send to the candidate:",
                        },
                    },
                    {
                        type: "input",
                        block_id: "email_template_select_block",
                        label: {
                            type: "plain_text",
                            text: "Email Template",
                            emoji: true,
                        },
                        element: {
                            type: "static_select",
                            placeholder: {
                                type: "plain_text",
                                text: "Select template",
                                emoji: true,
                            },
                            options: emailTemplates.map((template) => ({
                                text: {
                                    type: "plain_text",
                                    text: template.name,
                                    emoji: true,
                                },
                                value: template.id.toString(),
                            })),
                            action_id: "email_template_select",
                        },
                    },
                    {
                        type: "input",
                        block_id: "reject_comments",
                        label: {
                            type: "plain_text",
                            text: "Additional Comments",
                            emoji: true,
                        },
                        element: {
                            type: "plain_text_input",
                            multiline: true,
                            action_id: "reject_comments_input",
                        },
                    },
                ],
            },
        };
    } catch (error) {
        console.error("Error creating reject candidate modal:", error);
        throw error; // Ensure the error is handled by the caller
    }
}
async function getApplicationFromCandidateId(candidateId) {
    const candidateDetails = await fetchCandidateDetails(candidateId);

    // Extract Job ID from candidate details
    if (
        candidateDetails.applications &&
        candidateDetails.applications.length > 0
    ) {
        const application = candidateDetails.applications[0];
        return application;
    } else {
        throw new Error("No applications found for the candidate");
    }
    return null;
}
async function handleRejectCandidateSubmission(payload: SlackInteraction) {
    try {
        const { view, user, team } = payload;

        // Decode private_metadata
        const { response_url, message_blocks, attachments, candidate_id } =
            JSON.parse(view.private_metadata);

        const rejectReasonId =
            view.state.values.reject_reason_select_block.reject_reason_select
                .selected_option.value;
        const emailTemplateId =
            view.state.values.email_template_select_block.email_template_select
                .selected_option.value;
        const rejectComments =
            view.state.values.reject_comments.reject_comments_input.value;

        // Acknowledge the modal submission to close the modal
        const acknowledgmentResponse = NextResponse.json({}, { status: 200 });

        // Fetch Slack users based on the team ID from the payload
        const slackUsers = await getEmailsfromSlack(team.id);

        // Match Slack user to Greenhouse user
        const greenhouseUsers = await fetchGreenhouseUsers();
        const userMapping = await matchSlackToGreenhouseUsers(
            greenhouseUsers,
            slackUsers
        );
        const greenhouseUserId = userMapping[user.id];

        let statusMessage = "";
        let emoji = "✅";
        if (!greenhouseUserId) {
            statusMessage =
                "Failed to find corresponding Greenhouse user for the Slack user. This has been submitted.";
            emoji = "❌";
        } else {
            const cand_application =
                getApplicationFromCandidateId(candidate_id);
            const applicationId = cand_application.id;
            const result = await rejectApplicationInGreenhouse(
                applicationId,
                greenhouseUserId,
                rejectReasonId,
                emailTemplateId,
                rejectComments,
            );
            // const result = await rejectCandidateInGreenhouse(
            //     candidate_id,
            //     greenhouseUserId,
            //     rejectReasonId,
            //     emailTemplateId,
            //     rejectComments,
            // );
            if (result.success) {
                statusMessage =
                    "Candidate has been rejected successfully. This has been submitted.";
            } else {
                statusMessage = `Failed to reject candidate: ${result.error}. This has been submitted.`;
                emoji = "❌";
            }
        }

        // Add the new text message as a context block below the text and above the action buttons
        const contextBlock = {
            type: "context",
            elements: [
                {
                    type: "mrkdwn",
                    text: `${emoji} ${statusMessage}`,
                },
            ],
        };

        // Find the index of the first actions block
        const actionBlockIndex = attachments[0].blocks.findIndex(
            (block: any) => block.type === "actions",
        );

        if (actionBlockIndex !== -1) {
            // Insert the context block before the actions block
            attachments[0].blocks.splice(actionBlockIndex, 0, contextBlock);
        } else {
            // Add the context block to the end if no actions block is found
            attachments[0].blocks.push(contextBlock);
        }

        await updateSlackMessage(response_url, message_blocks, attachments);

        return acknowledgmentResponse;
    } catch (error) {
        console.error("Error handling submission:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function handleDebriefCommand(trigger_id, slackTeamId) {
    const accessToken = await getAccessToken(slackTeamId);

    const modalPayload = {
        trigger_id: trigger_id,
        view: {
            type: "modal",
            callback_id: "debrief_modal",
            title: {
                type: "plain_text",
                text: "Create Debrief",
            },
            blocks: [
                {
                    type: "input",
                    block_id: "name_block",
                    element: {
                        type: "plain_text_input",
                        action_id: "name_input",
                        placeholder: {
                            type: "plain_text",
                            text: "Enter debrief name (optional)",
                        },
                    },
                    label: {
                        type: "plain_text",
                        text: "Name",
                    },
                    optional: true,
                },
                {
                    type: "input",
                    block_id: "candidate_block",
                    element: {
                        type: "external_select",
                        action_id: "candidate",
                        placeholder: {
                            type: "plain_text",
                            text: "Loading candidates...",
                        },
                    },
                    label: {
                        type: "plain_text",
                        text: "Candidate",
                    },
                },
                {
                    type: "input",
                    block_id: "recipients_block",
                    element: {
                        type: "multi_users_select",
                        action_id: "recipients_input",
                        placeholder: {
                            type: "plain_text",
                            text: "Select recipients",
                        },
                    },
                    label: {
                        type: "plain_text",
                        text: "Recipients/Debrief Team",
                    },
                },
            ],
            submit: {
                type: "plain_text",
                text: "Create",
            },
            close: {
                type: "plain_text",
                text: "Cancel",
            },
        },
    };

    const { status, view_id, error } = await openModal(
        modalPayload,
        accessToken,
    );

    if (status === 200) {
        await fetchCandidateData(view_id, accessToken); // Fetch candidate data once the modal is opened
        return new NextResponse(null, {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } else {
        return new NextResponse(JSON.stringify({ error: error }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export async function POST(request) {
    const contentType = request.headers.get("content-type");
    if (contentType?.includes("application/json")) {
        console.log('GOOO BUCKS122')
        const data = await request.json();
        console.log('data - ',data)
        console.log('data hasArchive- ',typeof data.hasArchive)
        console.log('data hasDelete- ',data.hasDelete)
        console.log('data hasDelete- ',typeof data.hasDelete)

        if(data.hasArchive && !data.hasDelete){
            console.log('delete')
            const channelId = data.channelId
            const slackTeamId = data.slackTeamId
            try{
                try{
                    const deleteResponse = await archiveConversationInSlack(channelId, slackTeamId)
                }
                catch(e){
                    console.log('e delete convo-',e)
                }
                try{
                    console.log('prearchive')
                    await archiveConversationInDB(channelId)
                }
                catch(e){
                    console.log('e archive convo-',e)
                }
            }
            catch(e){
                console.log('e post slack-',e)
            }
        }
        else if(data.hasDelete){
            try{

                const channelId = data.channelId
                const slackTeamId = data.slackTeamId
                console.log('pre delete convo- channelId -',channelId)
                console.log('pre delete convo- slackTeamId -',slackTeamId)
                const deleteResponse = await deleteConversationInSlack(channelId, slackTeamId)
            }
            catch(e){
                console.log('eeee-',e)
            }
        }
        else{
            console.log('deers in else')
            return handleJsonPost(data);

        }
    } else if (contentType?.includes("application/x-www-form-urlencoded")) {
        console.log('GOOO BUCKS13')
        const text = await request.text();
        const params = new URLSearchParams(text);

        const command = params.get("command");
        const trigger_id = params.get("trigger_id");
        const team_id = params.get("team_id");
        if (command === "/debrief" && trigger_id) {
            return handleDebriefCommand(trigger_id, team_id);
        }

        const payloadRaw = params.get("payload");

        if (payloadRaw) {
            let hasDelete = payloadRaw.hasDelete
            if(hasDelete){
                console.log('GOOO BUCKS')
            }
            else{
                return handleSlackInteraction(JSON.parse(payloadRaw));

            }
        } else {
            return new NextResponse(
                JSON.stringify({
                    error: "Unrecognized form-urlencoded request",
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }
    }
    }
    catch(e){console.log('eeee overal -',e)}

    // import { useState } from 'react';
    async function archiveConversationInDB(channelId) {
        try{
            console.log('prearchive')

            await db
            .update(slackChannelsCreated)
            .set({ isArchived: true })
            .where(eq(slackChannelsCreated.channelId, channelId))
            .execute();
        }
        catch(e){
            console.log('eeee - ',e)
        }
    }

    async function archiveConversationInSlack(channelId,slackTeamId) {
        const accessToken = await getAccessToken(slackTeamId);
        console.log('channelId-',channelId)
        console.log('accessToken-',accessToken)
        const response = await fetch('https://slack.com/api/conversations.archive', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                channel: channelId
            })
        });


        const data = await response.json();
        if (!data.ok) {
            throw new Error(data.error);
        }

        return data;
    }
    async function deleteConversationInSlack(channelId,slackTeamId) {
        const accessToken = await getAccessToken(slackTeamId);
        console.log('channelId-',channelId)
        console.log('accessToken-',accessToken)
        const apikey = process.env.SLACK_BOT_TOKEN
        const apitoken = 'xoxe.xoxb-1-MS0yLTQ0MTYwOTk0MzE4NzgtNjk3Mjc2NjQ3Njk2NC02OTU2NzI4OTYzNjcxLTc0Mzg3MzA4OTczMzItNDMyZjIyYmI0Mzg2Yzg4ODIzMmRjNWUwZDk0MzA5NTFhNTE2YTBiMjE1YmRjMTM4NmE5MmJlYjRjZGE3MGQzZA'
        console.log('api key - ',apikey)
        const response = await fetch('https://slack.com/api/conversations.archive', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                channel: channelId
            })
        });


        const data = await response.json();
        if (!data.ok) {
            throw new Error(data.error);
        }

        return data;
    }

    return new NextResponse(
        JSON.stringify({ error: "Unsupported Content Type" }),
        {
            status: 400,
            headers: { "Content-Type": "application/json" },
        },
    );
}
