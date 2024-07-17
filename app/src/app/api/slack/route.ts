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

import type { NextRequest } from "next/server"; // Only used as a type
import { NextResponse } from "next/server";
import { checkForSlackTeamIDConflict, getAccessToken, setAccessToken } from "@/server/actions/slack/query";

import { siteUrls } from "@/config/urls";
import {
    fetchCandidateDetails,
    fetchEmailTemplates,
    fetchGreenhouseUsers,
    fetchRejectReasons,
    fetchStagesForJob,
    matchSlackToGreenhouseUsers,
    moveToNextStageInGreenhouse,
} from "@/server/greenhouse/core";
import { getEmailsfromSlack } from "@/server/slack/core";

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

            // Checks to see if there is a conflict fon the teamId in the DB
            const conflict = await checkForSlackTeamIDConflict(json.team.id);

            if (conflict) {
                const conflictUrl = `${siteUrls.publicUrl}/?conflict`;
                return NextResponse.redirect(conflictUrl);
            }

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
            slackUsers,
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

// Function to handle Slack interactions
async function handleSlackInteraction(payload: SlackInteraction) {
    const { type, actions, trigger_id, team, response_url, message } = payload;
    console.log(payload);
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
        console.log("handle slack interaction - pre access token");

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
async function openModal(
    modalPayload: any,
    accessToken: string | null | undefined,
) {
    const response = await fetch("https://slack.com/api/views.open", {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(modalPayload),
    });
    return new NextResponse(JSON.stringify({ message: "Modal opened" }), {
        status: response.ok ? 200 : 400,
        headers: { "Content-Type": "application/json" },
    });
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
            slackUsers,
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

export async function POST(request: Request) {
    const contentType = request.headers.get("content-type");
    if (contentType?.includes("application/json")) {
        const data = await request.json();
        return handleJsonPost(data);
    } else if (contentType?.includes("application/x-www-form-urlencoded")) {
        const text = await request.text();
        const params = new URLSearchParams(text);
        const payloadRaw = params.get("payload");

        if (payloadRaw) {
            return handleSlackInteraction(JSON.parse(payloadRaw));
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

    return new NextResponse(
        JSON.stringify({ error: "Unsupported Content Type" }),
        {
            status: 400,
            headers: { "Content-Type": "application/json" },
        },
    );
}
