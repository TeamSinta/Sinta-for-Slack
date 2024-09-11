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


export async function handleSlackEvent(data: any) {
  // Check if the event type is "block_actions"
  if (data.type === "block_actions") {
      // Handle block actions, specifically tab switching
      const userId = data?.user?.id; // User ID for block_actions
      const teamId = data?.team?.id; // Team ID for block_actions
      const action = data?.actions?.[0]?.action_id; // Action ID for block_actions
      const tab = "home"; // Default to "home" as block_actions doesn't have tab

      console.log("action:", action);
      console.log("tab:", tab);

      // Handle tab switching actions for block actions
      if (action) {
          switch (action) {
              case "home_tab":
                  return loadUserDashboard(userId, teamId, "home");
              case "hiring_rooms_tab":
                  return loadUserDashboard(userId, teamId, "hiring_rooms");
              case "candidate_rooms_tab":
                  return loadUserDashboard(userId, teamId, "candidates");
              case "jobs_tab":
                  return loadUserDashboard(userId, teamId, "jobs");
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
  } else {
      // Handle regular Slack events
      console.log("Slack Event:", data.event);

      const userId = data?.event?.user;
      const teamId = data?.event?.view?.team_id;
      const tab = data?.event?.tab;
      const action = data?.actions?.[0]?.action_id;

      console.log("action:", action);
      console.log("tab:", tab);

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

      // Handle tab switching actions for regular events
      if (action) {
          switch (action) {
              case "home_tab":
                  return loadUserDashboard(userId, teamId, "home");
              case "hiring_rooms_tab":
                  return loadUserDashboard(userId, teamId, "hiring_rooms");
              case "candidate_rooms_tab":
                  return loadUserDashboard(userId, teamId, "candidates");
              case "jobs_tab":
                  return loadUserDashboard(userId, teamId, "jobs");
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
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Handle Slack URL verification challenge
        if (data.type === "url_verification") {
            return new NextResponse(
                JSON.stringify({ challenge: data.challenge }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }

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
    const orgID = getOrgIdBySlackTeamId(teamId);
    const inviteLink = `https://5bc1e5fa5023dc7a.ngrok.app/invite/org/${orgID}?slackUserId=${orgID}`;

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

async function loadUserDashboard(userId: string, teamId: string, p0: string) {
    try {
        // Step 1: Get user email and preferences
        const userEmail = await getUserEmailBySlackIdAndTeamId(userId, teamId);
        if (!userEmail) {
            throw new Error("User email not found");
        }
        console.log("Inside loader");

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
                        text: "Switch tabs to manage candidates, channels, and jobs.",
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
                          text: "👤 Candidates",
                          emoji: true,
                      },
                      action_id: "candidate_rooms_tab",
                  },
                    {
                        type: "button",
                        text: {
                            type: "plain_text",
                            text: "🛠️ Hiring Channels",
                            emoji: true,
                        },
                        action_id: "hiring_rooms_tab",
                    },

                    {
                        type: "button",
                        text: {
                            type: "plain_text",
                            text: "📋 Jobs",
                            emoji: true,
                        },
                        action_id: "jobs_tab",
                    },
                ],
            },
            {
                type: "divider",
            },
        ];

        // Always default to the Home tab if none is selected
        const selectedTab = p0 || "home";
        console.log("selectedTab:", selectedTab);
        // Step 3: Add content based on the selected tab
        if (selectedTab === "home") {
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
                                url: interview.feedbackLink || "https://5bc1e5fa5023dc7a.ngrok.app/workspaces",
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
        } else if (selectedTab === "candidates") {
            // Step 8: Handle non-home tabs


          blocks.push({
              type: "header",
              text: {
                  type: "plain_text",
                  text: "👤 Candidate View",
                  emoji: true,
              },
          });

          blocks.push({
              type: "section",
              text: {
                  type: "mrkdwn",
                  text: "View and manage all candidate details, stages, and actions in *one* place.",
              },
          });

          blocks.push({
              type: "divider",
          });

          // Example candidates (you can dynamically fetch these based on your data)
          const candidates = [
              {
                  name: "John Doe",
                  stage: "Interviewing",
                  nextSteps: "Technical Interview with <@U06UPA4MQ13> @ 10/24/24",
                  progress: "🟩🟩🟩⬜⬜",
              },
              {
                  name: "Jane Smith",
                  stage: "Screening",
                  nextSteps: "Interview completed",
                  progress: "🟩🟩⬜⬜⬜",
              },
              {
                  name: "Bob Brown",
                  stage: "Offer Stage",
                  nextSteps: "Offer presented",
                  progress: "🟩🟩🟩🟩⬜",
              },
              {
                  name: "Ann Lee",
                  stage: "Final Review",
                  nextSteps: "Screening Interview with <@U06UKCS4NDU>",
                  progress: "🟩🟩🟩🟩⬜",
              },
          ];

          candidates.forEach((candidate) => {
              blocks.push({
                  type: "section",
                  text: {
                      type: "mrkdwn",
                      text: `<https://candidateprofile.com/${candidate.name
                          .toLowerCase()
                          .replace(" ", "")}|*${candidate.name}*>`,
                  },
              });

              blocks.push({
                  type: "section",
                  text: {
                      type: "mrkdwn",
                      text: `*Stage:* ${candidate.stage}\n*Next Steps:* ${candidate.nextSteps}`,
                  },
              });

              blocks.push({
                  type: "section",
                  text: {
                      type: "mrkdwn",
                      text: `*Progress:*\n${candidate.progress}`,
                  },
              });

              blocks.push({
                  type: "actions",
                  elements: [
                      {
                          type: "button",
                          text: {
                              type: "plain_text",
                              text: "Move to Stage",
                              emoji: true,
                          },
                          style: "primary",
                          value: "move_stage",
                      },
                      {
                          type: "button",
                          text: {
                              type: "plain_text",
                              text: "Reject",
                              emoji: true,
                          },
                          style: "danger",
                          value: "reject",
                      },
                      {
                          type: "button",
                          text: {
                              type: "plain_text",
                              text: "Create Candidate Channel",
                              emoji: true,
                          },
                          value: "create_channel",
                      },
                      {
                          type: "button",
                          text: {
                              type: "plain_text",
                              text: "See Profile",
                              emoji: true,
                          },
                          value: "profile",
                      },
                      {
                          type: "overflow",
                          options: [
                              {
                                  text: {
                                      type: "plain_text",
                                      text: "See all interviews",
                                  },
                                  value: "interviews",
                              },
                              {
                                  text: {
                                      type: "plain_text",
                                      text: "See activity feed",
                                  },
                                  value: "activity",
                              },
                              {
                                  text: {
                                      type: "plain_text",
                                      text: "View scorecards",
                                  },
                                  value: "scorecards",
                              },
                          ],
                      },
                  ],
              });

              blocks.push({
                  type: "divider",
              });
          });
      }

      else if (selectedTab === "hiring_rooms") {
        // Step 8: Handle non-home tabs for "Hiring Channels"
        blocks.push({
            type: "header",
            text: {
                type: "plain_text",
                text: "🛠️ Hiring Channels View",
                emoji: true,
            },
        });

        blocks.push({
            type: "section",
            text: {
                type: "mrkdwn",
                text: "Manage all your debrief, role, and candidate channels in *one* place.",
            },
        });

        blocks.push({
            type: "divider",
        });

        // Debrief Rooms
        blocks.push({
            type: "header",
            text: {
                type: "plain_text",
                text: "Debrief Rooms",
            },
        });

        const debriefRooms = [
            {
                channel: "#debrief-director-of-sales-development",
                role: "Director of Sales Development",
            },
        ];

        debriefRooms.forEach((room) => {
            blocks.push({
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*${room.channel}*\nRole: ${room.role}`,
                },
                accessory: {
                    type: "button",
                    text: {
                        type: "plain_text",
                        text: "Archive",
                        emoji: true,
                    },
                    value: "archive_room",
                },
            });

            blocks.push({
                type: "divider",
            });
        });

        // Role Channels
        blocks.push({
            type: "header",
            text: {
                type: "plain_text",
                text: "Role Channels",
            },
        });

        const roleChannels = [
            {
                channel: "#hire-sales-engineering-2024",
                role: "Head of Engineering",
            },
            {
                channel: "#hire-head-of-sales",
                role: "Head of Sales",
            },
            {
                channel: "#hire-head-ops-2024",
                role: "Head of Operations",
            },
        ];

        roleChannels.forEach((roleChannel) => {
            blocks.push({
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*${roleChannel.channel}*\nRole: ${roleChannel.role}`,
                },
                accessory: {
                    type: "button",
                    text: {
                        type: "plain_text",
                        text: "Archive",
                        emoji: true,
                    },
                    value: "archive_room",
                },
            });

            blocks.push({
                type: "divider",
            });
        });

        // Candidate Channels
        blocks.push({
            type: "header",
            text: {
                type: "plain_text",
                text: "Candidate Channels",
            },
        });

        const candidateChannels = [
            {
                channel: "#sales-development--enet-2024-04-07-dave-matthews",
                role: "Sales Development Repenentative",
            },
        ];

        candidateChannels.forEach((candidateChannel) => {
            blocks.push({
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*${candidateChannel.channel}*\nCandidate: ${candidateChannel.role}`,
                },
                accessory: {
                    type: "button",
                    text: {
                        type: "plain_text",
                        text: "Archive",
                        emoji: true,
                    },
                    value: "archive_room",
                },
            });

            blocks.push({
                type: "divider",
            });
        });
      }

      else if (selectedTab === "jobs") {
        // Step 8: Handle non-home tabs for "Jobs View"

        blocks.push({
            type: "header",
            text: {
                type: "plain_text",
                text: "📋 Jobs View",
                emoji: true,
            },
        });

        blocks.push({
            type: "context",
            elements: [
                {
                    type: "plain_text",
                    text: "View and manage all job roles, teams, and hiring rooms.",
                    emoji: true,
                },
            ],
        });

        blocks.push({
            type: "divider",
        });

        // Job roles
        const jobs = [
            {
                role: "Head of Engineering",
                department: "Engineering",
                team: [
                    { name: "Recruiting Coordinator", id: "<@U05Q2TYGV5X>" },
                    { name: "Hiring Manager", id: "<@U04L1685M5J>" },
                ],
                channel: "<#C06UJKWG4G2>",
            },
            {
                role: "Head of Sales",
                department: "Sales",
                team: [
                    { name: "Recruiting Coordinator", id: "<@U04KS4AQG0N>" },
                    { name: "Hiring Manager", id: "<@U07JZV45HTQ>" },
                ],
                channel: "<#C07BW7W025R>",
            },
            {
                role: "Head of Operations",
                department: "Operations",
                team: [
                    { name: "Recruiting Coordinator", id: "<@U06CKTBCABG>" },
                    { name: "Hiring Manager", id: "<@U06PELS9R7Z>" },
                ],
                channel: "<#C07CK50C7RN>",
            },
        ];

        jobs.forEach((job) => {
            blocks.push({
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*Role:* ${job.role}\n*Department:* ${job.department}\n*Hiring Team:* ${job.team
                        .map((member) => `${member.id} (${member.name})`)
                        .join(", ")}\n*Hiring Room Channel:* ${job.channel}`,
                },
            });

            blocks.push({
                type: "actions",
                elements: [
                    {
                        type: "button",
                        text: {
                            type: "plain_text",
                            text: "Job details",
                            emoji: true,
                        },
                        value: "view_job",
                    },
                    {
                        type: "button",
                        text: {
                            type: "plain_text",
                            text: "Create Hiring Room",
                            emoji: true,
                        },
                        value: "create_room",
                    },
                ],
            });

            blocks.push({
                type: "divider",
            });
        });
    }


        else
        {
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
    console.log(JSON.stringify(blocks, null, 2)); // This logs the block structure you're sending


    if (!data.ok) {
        throw new Error(`Failed to update Slack Home Tab: ${data.error}`);
    }

    return data;
}
