import type { NextRequest } from "next/server";
import crypto from "crypto";
import { getAccessToken } from "@/server/actions/slack/query";
import { env } from "@/env";

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

interface SlackBlock {
    type: string;
    text?: {
        type: string;
        text: string;
        emoji?: boolean;
    };
    elements?: Element[];
    accessory?: Element; // For blocks that include buttons or other interactive elements as accessories
}

interface Element {
    type: string;
    text?:
        | {
              type: string;
              text: string;
              emoji?: boolean;
          }
        | string; // Allowing both object and string types for text
    value?: string;
    action_id?: string;
    options?: Option[];
}

interface Option {
    text: {
        type: string;
        text: string;
        emoji?: boolean;
    };
    value: string;
}

interface SlackData {
    // Ensure this is passed where needed
    // Ensure this is passed where needed
    scorecard_id: number | null; // Ensure this is passed where needed

    questions: Question[];
    interviewer: Interviewer;
    interviewStep: string; // Previously `interview`, ensure consistency in naming
    overallRecommendation: string; // Make sure this is passed to `configureBlocks`
}

interface InterviewData {
    // Ensure this is passed where needed
    teamId: string | null;
    scorecard_id: number | null; // Ensure this is passed where needed
    questions: Question[];
    interviewer: Interviewer;
    interviewStep: string; // Previously `interview`, ensure consistency in naming
    overallRecommendation: string; // Make sure this is passed to `configureBlocks`
}
interface Interviewer {
    id: number;
    first_name: string;
    last_name: string;
    name: string;
    employee_id: string;
}

interface Question {
    id: number | null;
    question: string;
    answer: string;
}
export async function sendSlackMessage(interviewData: InterviewData) {
    const {
        teamId,
        questions,
        interviewer,
        interviewStep,
        overallRecommendation,
        scorecard_id,
    } = interviewData;

    if (!teamId) {
        console.error("No team ID provided, unable to send Slack message.");
        return; // Exit the function or throw an error, depending on your error handling strategy
    }

    const accessToken = await getAccessToken(teamId);
    console.log(`Sending message to team ${teamId}`);
    console.log(scorecard_id);

    // Prepare blocks for the Slack message
    const blocks = configureBlocks({
        questions,
        interviewer,
        interviewStep, // Make sure `interviewStep` is being passed correctly
        overallRecommendation,
        scorecard_id, // Ensure this is correctly included
    });

    const response = await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            blocks: blocks,
            channel: "U06URRX3V0S", // Update with actual channel ID
        }),
    });
    console.log(response);

    return { response };
}

export const configureBlocks = ({
    interviewer,
    interviewStep,
    overallRecommendation,
    scorecard_id,
}: SlackData) => {
    const blocks: SlackBlock[] = [
        {
            type: "header",
            text: {
                type: "plain_text",
                text: ":star2: Interview Wrap-Up Reminder :star2:",
                emoji: true,
            },
        },
        {
            type: "context",
            elements: [
                {
                    text: "Indicate your hiring recommendation (e.g., Proceed, On Hold, or Do Not Proceed).",
                    type: "mrkdwn",
                },
            ],
        },

        {
            type: "divider",
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `*:bell: Action Required* \n \nHello ${interviewer.name}, thank you for completing your interview session for the Sales Development role. We hope it was an insightful conversation! Please complete your interview feedback to help us make an informed hiring decision.`,
            },
        },
        {
            type: "divider",
        },

        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: "*:memo: Scorecard* \n\n Please review the scorecard and submit your detailed feedback, highlighting the candidate's strengths and areas for improvement. Your insights are crucial for our hiring process.",
            },
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `*Interview Step*: ${interviewStep}`,
            },
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: "*Click here to submit your feedback*:",
            },
            accessory: {
                type: "button",
                text: {
                    type: "plain_text",
                    text: "Complete Feedback", // Changed the button text to match the action_id previously used
                    emoji: true,
                },
                value: `${scorecard_id}`, // Using dynamic value passed from the function parameters
                action_id: "feedback_button", // Consistent with your previous usage
            },
        },

        {
            type: "context",
            elements: [
                {
                    type: "mrkdwn",
                    text: ":pushpin: Thank you for your contribution! Please ensure to submit your feedback within 24 hours.",
                },
            ],
        },
    ];

    return blocks;
};

// export async function respondToSlack(
//   res: NextApiResponse,
//   response_url: string,
//   teamId: string,
//   feedback?: {
//     keyword?: string;
//     channel?: string;
//   }
// ) {
//   const { keywords, channel, unfurls, notifications } =
//     await getTeamConfigAndStats(teamId); // get the latest state of the bot configurations to make sure it's up to date

//   // respond to Slack with the new state of the bot
//   const response = await fetch(response_url, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       blocks: configureBlocks(
//         keywords,
//         channel,
//         unfurls,
//         notifications,
//         feedback
//       ),
//     }),
//   });
//   return res.status(200).json(response);
// }
