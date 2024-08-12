// @ts-nocheck

import { NextResponse } from "next/server";
import {
    getAccessToken,
    isUserMemberOfOrg,
} from "@/server/actions/slack/query";
import {
    getUserEmailBySlackIdAndTeamId,
    getUserPreferences,
} from "@/server/actions/organization/queries";
import {
    fetchScheduledInterviews,
    filterInterviewsForUser,
} from "@/server/greenhouse/core";

async function handleSlackEvent(data: any) {
    console.log("Slack Event:", data.event);

    const userId = data?.event?.user;
    const teamId = data?.event?.view?.team_id;
    const tab = data?.event?.tab;
    const action = data?.actions?.[0]?.action_id;

    // If the tab is not 'home', return a 200 response immediately
    if (tab !== "home") {
        return new NextResponse(
            JSON.stringify({
                message: "Non-home tab event received and ignored",
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
        );
    }

    // Make sure the values are not undefined
    if (!userId || !teamId) {
        throw new Error("Invalid userId, teamId, or tab not 'home'");
    }

    // Handle tab switching actions
    if (action) {
        switch (action) {
            case "home_tab":
                return loadUserDashboard(userId, teamId, "home");
            case "dealrooms_tab":
                return loadUserDashboard(userId, teamId, "dealrooms");
            case "candidate_rooms_tab":
                return loadUserDashboard(userId, teamId, "candidate_rooms");
            case "debrief_rooms_tab":
                return loadUserDashboard(userId, teamId, "debrief_rooms");
            default:
                console.error("Unknown action_id:", action);
                return new NextResponse(
                    JSON.stringify({ error: "Unknown action_id" }),
                    {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    },
                );
        }
    }

    // Perform your database operations or other logic here
    const isMember = await isUserMemberOfOrg({
        slackUserId: userId,
        slackTeamId: teamId,
    });

    console.log("Is member:", isMember);

    if (!isMember) {
        return showInviteScreen(userId, teamId);
    } else {
        return loadUserDashboard(userId, teamId, "home");
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        if (
            data.type === "event_callback" &&
            data.event.type === "app_home_opened"
        ) {
            return await handleSlackEvent(data);
        }

        return new NextResponse(JSON.stringify({ error: "Bad request" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error handling Slack event:", error);
        return new NextResponse(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        );
    }
}

async function showInviteScreen(userId: string, teamId: string) {
    const inviteLink = `https://5bc1e5fa5023dc7a.ngrok.app/invite/org/032cd629-9d52-4d9f-9e10-cf772b7c30ed?slackUserId=${userId}`;

    const blocks = [
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: "*Welcome to Sinta! 🎉* \n\nWe're excited to have you here!\nFollow these simple steps to get started with Sinta and join your team's workspace.",
            },
            accessory: {
                type: "image",
                image_url:
                    "https://assets-global.website-files.com/6457f112b965721ffc2b0777/653e865d87d06c306e2b5147_Group%201321316944.png",
                alt_text: "Welcome Image",
            },
        },
        {
            type: "divider",
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: "       \n \n*1)* *Create an Account*\n\n\nUse your work email to create a Sinta account. \nThis will give you access to all the tools you need to collaborate with your team.",
            },
            accessory: {
                type: "button",
                text: {
                    type: "plain_text",
                    text: "Create an Account",
                    emoji: true,
                },

                url: inviteLink,
            },
        },
        {
            type: "divider",
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: " *2)*  *Request to Join Your Team*\n\n\nClick the button below to send a request to join your team's Sinta workspace.\n Once approved, you'll be able to collaborate with your colleagues seamlessly.\n\n",
            },
            accessory: {
                type: "button",
                text: {
                    type: "plain_text",
                    text: "Request to Join Team",
                    emoji: true,
                },
                style: "primary",
                url: inviteLink,
            },
        },
        {
            type: "divider",
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: " *Tip*:bulb:: If you encounter any issues, please reach out to your team's admin for assistance.",
            },
        },
    ];

    await updateSlackHomeTab(userId, teamId, blocks);

    return new NextResponse(JSON.stringify({ success: true }), { status: 200 });
}

async function loadUserDashboard(
    userId: string,
    teamId: string,
    p0: string,
) {
    try {
        // Step 1: Get user email and preferences
        const userEmail = await getUserEmailBySlackIdAndTeamId(userId, teamId);
        if (!userEmail) {
            throw new Error("User email not found");
        }

        const preferences = await getUserPreferences(userId, teamId);

        // Step 2: Initialize blocks with the tab switcher and dashboard header
        const blocks: any[] = [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: `Welcome to Sinta :wave:`,
                    emoji: true,
                },
            },
            {
                type: "context",
                elements: [
                    {
                        type: "mrkdwn",
                        text: "_Switch Views...Coming Soon:_",
                    },
                ],
            },
            {
                type: "actions",
                elements: [
                    {
                        type: "button",
                        text: {
                            type: "plain_text",
                            text: ":house_with_garden: Home",
                            emoji: true,
                        },
                        action_id: "home_tab",
                        style:
                            preferences.selectedTab === "home_tab"
                                ? "primary"
                                : undefined,
                    },
                    {
                        type: "button",
                        text: {
                            type: "plain_text",
                            text: "Dealrooms",
                            emoji: true,
                        },
                        action_id: "dealrooms_tab",
                    },
                    {
                        type: "button",
                        text: {
                            type: "plain_text",
                            text: "Candidate Channels",
                            emoji: true,
                        },
                        action_id: "candidate_rooms_tab",
                    },
                    {
                        type: "button",
                        text: {
                            type: "plain_text",
                            text: "Debrief Rooms",
                            emoji: true,
                        },
                        action_id: "debrief_rooms_tab",
                    },
                ],
            },
            {
                type: "divider",
            },
        ];

        // Always default to the Home tab if none is selected
        const selectedTab = preferences.selectedTab || "home_tab";

        // Step 3: Add content based on the selected tab
        if (selectedTab === "home_tab") {
            blocks.push({
                type: "header",
                text: {
                    type: "plain_text",
                    text: `${preferences.role}'s Home Dashboard :house_with_garden:`,
                    emoji: true,
                },
            });

            blocks.push({
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `Hi <@${userId}>,\n\ here is a quick overview of your upcoming interviews and pending tasks.`,
                },
            });

            // Step 4: Fetch all scheduled interviews from Greenhouse
            const allInterviews = await fetchScheduledInterviews();
            const userInterviews = filterInterviewsForUser(
                allInterviews,
                userEmail,
            );

            // Step 5: Filter and display Upcoming Interviews
            if (preferences.upcomingInterviews) {
                const upcomingInterviews = userInterviews.filter(
                    (interview) => interview.status === "scheduled",
                );

                if (upcomingInterviews.length > 0) {
                    blocks.push({
                        type: "header",
                        text: {
                            type: "plain_text",
                            text: "Upcoming Interviews :calendar: ",
                            emoji: true,
                        },
                    });

                    upcomingInterviews.forEach((interview) => {
                        const duration = getInterviewDuration(
                            interview.start.date_time,
                            interview.end.date_time,
                        );
                        const interviewBlock = {
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text: `*${interview.interviewers[0].name}*\n*Type:* ${interview.interview.name}\n*Date:* ${new Date(interview.start.date_time).toLocaleDateString()}\n*Time:* ${new Date(interview.start.date_time).toLocaleTimeString()}\n*Duration:* ${duration}\n*Location:* ${interview.location || "TBD"}`,
                            },
                        };

                        if (interview.video_conferencing_url) {
                            interviewBlock.accessory = {
                                type: "button",
                                text: {
                                    type: "plain_text",
                                    text: "Join Zoom Meeting",
                                    emoji: true,
                                },
                                url: interview.video_conferencing_url,
                                style: "primary",
                            };
                        }

                        blocks.push(interviewBlock);
                    });
                }
            }

            // Step 6: Filter and display Pending Feedback
            if (preferences.pendingFeedback) {
                const pendingFeedback = userInterviews.filter(
                    (interview) => interview.status === "awaiting_feedback",
                );

                blocks.push({
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: "Pending Feedback :pencil2:",
                        emoji: true,
                    },
                });

                if (pendingFeedback.length > 0) {
                    pendingFeedback.forEach((interview) => {
                        const interviewEndDate = new Date(
                            interview.end.date_time,
                        );
                        const formattedEndDate =
                            interviewEndDate.toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            });

                        blocks.push({
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text: `*${interview.interviewers[0].name}*\n*Type:* ${interview.interview.name}\nInterview completed on ${formattedEndDate}\n*Status:* Awaiting Feedback`,
                            },
                            accessory: {
                                type: "button",
                                text: {
                                    type: "plain_text",
                                    text: "Complete Feedback",
                                    emoji: true,
                                },
                                url: interview.feedbackLink || "#",
                                style: "primary",
                            },
                        });
                    });
                } else {
                    blocks.push({
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: "Looks like you're all clear! \nNo pending feedback tasks at the moment.",
                        },
                    });
                }

                blocks.push({ type: "divider" });
            }
            // Step 7: Display Resources section if enabled
            if (
                preferences.resourcesEnabled &&
                preferences.resources.length > 0
            ) {
                blocks.push({
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: "Resources :book: ",
                        emoji: true,
                    },
                });

                blocks.push({
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: "Here are some useful links to help you with your interviews:",
                    },
                });

                const resourceButtons = preferences.resources.map(
                    (resource) => ({
                        type: "button",
                        text: {
                            type: "plain_text",
                            text: resource.label,
                            emoji: true,
                        },
                        url: resource.link,
                        style: "primary",
                    }),
                );

                blocks.push({
                    type: "actions",
                    elements: resourceButtons,
                });
            }
        } else {
            // Step 8: Handle non-home tabs
            blocks.push({
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "Coming soon...",
                },
            });
        }

        // Step 9: Update Slack Home Tab with the constructed blocks
        await updateSlackHomeTab(userId, teamId, blocks);

        return new NextResponse(JSON.stringify({ success: true }), {
            status: 200,
        });
    } catch (error) {
        console.error("Error loading dashboard:", error);
        return new NextResponse(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500 },
        );
    }
}

function getInterviewDuration(start: string, end: string): string {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const durationInMinutes =
        (endTime.getTime() - startTime.getTime()) / (1000 * 60);

    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;

    return `${hours > 0 ? `${hours} hour${hours > 1 ? "s" : ""}` : ""} ${minutes} minute${minutes !== 1 ? "s" : ""}`.trim();
}

async function updateSlackHomeTab(userId: string, teamId: string, blocks: any) {
    const accessToken = await getAccessToken(teamId);

    const response = await fetch("https://slack.com/api/views.publish", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            user_id: userId,
            view: {
                type: "home",
                blocks,
            },
        }),
    });
    console.log(response);
    const data = await response.json();
    console.log(data);

    if (!data.ok) {
        throw new Error(`Failed to update Slack Home Tab: ${data.error}`);
    }

    return data;
}
