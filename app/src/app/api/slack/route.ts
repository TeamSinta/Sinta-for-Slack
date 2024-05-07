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
import { getAccessToken, setAccessToken } from "@/server/actions/slack/query";
import { env } from "@/env";
import { headers } from "next/headers";
import { siteUrls } from "@/config/urls";
import { fetchScorecard } from "@/hooks/mock-data";

// Define the type for the response from Slack's OAuth endpoint
interface SlackOAuthResponse {
    access_token?: string;
    team?: {
        id?: string;
        name?: string;
    };
    error?: string;
}
interface SlackInteraction {
    type: string;
    actions: SlackAction[];
    trigger_id: string;
    team: { id: string };
}

// Define the type for a Slack action
interface SlackAction {
    action_id: string;
    value?: string;
}

// Define the type for the response from Slack's OAuth endpoint
interface SlackOAuthResponse {
    access_token?: string;
    team?: { id?: string; name?: string };
    error?: string;
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
    const clientSecret = env.SLACK_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return new NextResponse(
            JSON.stringify({
                message: "Slack client ID or secret is undefined.",
            }),
            { status: 500 },
        );
    }

    try {
        const response = await fetch(
            `https://slack.com/api/oauth.v2.access?client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&code=${encodeURIComponent(code)}`,
            { method: "POST", headers: new Headers(headers()) },
        );
        const json = (await response.json()) as SlackOAuthResponse;
        console.log(json);
        if (json.access_token && json.team?.id) {
            const updateResponse = await setAccessToken(
                json.access_token,
                json.team.id,
            );
            console.log(json.access_token);

            if (updateResponse === "OK") {
                siteUrls;
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
                        "No access token or team id found in response from Slack's OAuth.",
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

async function handleJsonPost(data: JSON) {
    console.log("Handling JSON POST", data);
    return new NextResponse(
        JSON.stringify({ message: "JSON POST handled successfully" }),
        {
            status: 200,
            headers: { "Content-Type": "application/json" },
        },
    );
}

// Function to handle Slack interactions
async function handleSlackInteraction(payload: SlackInteraction) {
    console.log("Handling Slack Interaction", payload);
    const { type, actions, trigger_id, team } = payload;

    if (type === "block_actions") {
        const action = actions.find(
            (action) => action.action_id === "feedback_button",
        );
        const actionValue = actions[0];
        if (!actionValue) {
            console.error("No value found in the action");
            // Handle this situation appropriately, maybe return or throw an error
            return;
        }
        const value = actionValue.value;

        if (!value) {
            console.error("No value found in the action");
            // Handle this situation appropriately, maybe return or throw an error
            return;
        }
        if (action) {
            const accessToken = await getAccessToken(team.id);
            const modalPayload = await createModalPayload(trigger_id, value);
            return openModal(modalPayload, accessToken);
        }
    } else if (type === "view_submission") {
        return handleModalSubmission(payload);
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
    const responseData = await response.json();
    console.log("Modal open response:", responseData);
    return new NextResponse(JSON.stringify({ message: "Modal opened" }), {
        status: response.ok ? 200 : 400,
        headers: { "Content-Type": "application/json" },
    });
}

// Function to handle modal submission
async function handleModalSubmission(payload: any) {
    const { team, user } = payload;
    const accessToken = await getAccessToken(team.id); // Assuming a function to get access tokens

    // Log for debugging
    console.log("Attempting to post submission acknowledgment message.");

    // Post a message to the user or channel as needed
    const postMessageResponse = await postMessage(user.id, accessToken);

    // Check if the message was posted successfully
    if (postMessageResponse.ok) {
        console.log("Acknowledgment message posted successfully.");
    } else {
        console.error("Failed to post message:", postMessageResponse.error);
    }

    // Important: Respond with an empty body to close the modal
    return new Response(null, {
        status: 200, // Just a status 200 with no content
    });
}

// Function to post a message to the user or channel
async function postMessage(
    userId: string,
    accessToken: string | null | undefined,
) {
    const url = "https://slack.com/api/chat.postMessage";
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
    };
    const body = JSON.stringify({
        channel: userId, // Direct message to the user who submitted the modal
        text: "Thank you! Feedback Received :thumbsup:",
    });

    const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: body,
    });

    return response.json(); // Parses the JSON response and returns it
}
// Creating the modal payload separately
async function createModalPayload(trigger_id: string, teamId: number) {
    const interviewData = await fetchScorecard(teamId); // Assuming this fetches relevant data
    if (!interviewData) {
        throw new Error("Scorecard data is missing."); // Throw an error to be handled by the caller
    }

    return {
        trigger_id: trigger_id,
        view: {
            type: "modal",
            callback_id: "submit_feedback",
            title: {
                type: "plain_text",
                text: "Scorecard Feedback",
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
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: `Feedback for ${interviewData.interviewer.name}`,
                        emoji: true,
                    },
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*Interview Step:* ${interviewData.interview_step.name}`,
                    },
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: ":memo: Please provide your feedback on the following aspects of the interview. Your insights are invaluable.",
                    },
                },

                {
                    type: "divider",
                },
                ...interviewData.questions.map((question) => ({
                    type: "input",

                    label: {
                        type: "plain_text",
                        text: question.question,
                        emoji: true,
                    },
                    element: {
                        type: "plain_text_input",
                        multiline: true,
                        action_id: `answer_${question.id}`,
                    },
                })),
                {
                    type: "input",
                    block_id: "overall_recommendation",
                    label: {
                        type: "plain_text",
                        text: "Overall Recommendation",
                        emoji: true,
                    },
                    element: {
                        type: "static_select",
                        placeholder: {
                            type: "plain_text",
                            text: "Choose recommendation",
                            emoji: true,
                        },
                        options: [
                            {
                                text: {
                                    type: "plain_text",
                                    text: "👍 Recommend",
                                    emoji: true,
                                },
                                value: "recommend",
                            },
                            {
                                text: {
                                    type: "plain_text",
                                    text: "👎 Don't Recommend",
                                    emoji: true,
                                },
                                value: "do_not_recommend",
                            },
                            {
                                text: {
                                    type: "plain_text",
                                    text: "💯 Highly Recommend",
                                    emoji: true,
                                },
                                value: "highly_recommend",
                            },
                        ],
                        action_id: "recommendation_select",
                    },
                },
            ],
        },
    };
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
