import { NextResponse } from 'next/server';
import { getAccessToken, isUserMemberOfOrg } from '@/server/actions/slack/query';

async function handleSlackEvent(data: any) {
  console.log('Slack Event:', data.event);

  const userId = data?.event?.user;
  const teamId = data?.event?.view?.team_id;
  const tab = data?.event?.tab;

  console.log('User ID:', userId);
  console.log('Team ID:', teamId);
  console.log('Tab:', tab);

  // If the tab is not 'home', return a 200 response immediately
  if (tab !== 'home') {
      return new NextResponse(
          JSON.stringify({ message: 'Non-home tab event received and ignored' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
  }

  // Make sure the values are not undefined
  if (!userId || !teamId) {
      throw new Error("Invalid userId, teamId, or tab not 'home'");
  }

  // Perform your database operations or other logic here
  const isMember = await isUserMemberOfOrg({
      slackUserId: userId,
      slackTeamId: teamId,
  });

  if (!isMember) {
      return showInviteScreen(userId, teamId);
  } else {
      return loadUserDashboard(userId, teamId);
  }
}

export async function POST(request: Request) {
  try {
      const data = await request.json();

      if (data.type === 'event_callback' && data.event.type === 'app_home_opened') {
          return await handleSlackEvent(data);
      }

      return new NextResponse(JSON.stringify({ error: 'Bad request' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
      });
  } catch (error) {
      console.error('Error handling Slack event:', error);
      return new NextResponse(
          JSON.stringify({ error: 'Internal server error' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
  }
}

async function showInviteScreen(userId: string, teamId: string) {
  const inviteLink = `https://5bc1e5fa5023dc7a.ngrok.app/invite/org/032cd629-9d52-4d9f-9e10-cf772b7c30ed?slackUserId=${userId}`;

  const blocks = [

      {
          "type": "section",
          "text": {
              "type": "mrkdwn",
              "text": "*Welcome to Sinta! 🎉* \n\nWe're excited to have you here!\nFollow these simple steps to get started with Sinta and join your team's workspace."
          },
          "accessory": {
              "type": "image",
              "image_url": "https://assets-global.website-files.com/6457f112b965721ffc2b0777/653e865d87d06c306e2b5147_Group%201321316944.png",
              "alt_text": "Welcome Image"
          },
      },
      {
          "type": "divider"
      },
      {
          "type": "section",
          "text": {
              "type": "mrkdwn",
              "text": "       \n \n*1)* *Create an Account*\n\n\nUse your work email to create a Sinta account. \nThis will give you access to all the tools you need to collaborate with your team."
          },
          "accessory": {
            "type": "button",
            "text": {
                "type": "plain_text",
                "text": "Create an Account",
                "emoji": true
            },

            "url": inviteLink
        }
      },
      {
          "type": "divider"
      },
      {
          "type": "section",
          "text": {
              "type": "mrkdwn",
              "text": " *2)*  *Request to Join Your Team*\n\n\nClick the button below to send a request to join your team's Sinta workspace.\n Once approved, you'll be able to collaborate with your colleagues seamlessly.\n\n"
          },
          "accessory": {
              "type": "button",
              "text": {
                  "type": "plain_text",
                  "text": "Request to Join Team",
                  "emoji": true
              },
              "style": "primary",
              "url": inviteLink
          }
      },
      {
          "type": "divider"
      },
      {
          "type": "section",
          "text": {
              "type": "mrkdwn",
              "text": " *Tip*:bulb:: If you encounter any issues, please reach out to your team's admin for assistance."
          }
      }
  ];

  await updateSlackHomeTab(userId, teamId, blocks);

  return new NextResponse(JSON.stringify({ "success": true }), { "status": 200 });
}




async function loadUserDashboard(userId: string, teamId: string) {
    const blocks = [
        {
            type: 'header',
            text: {
                type: 'plain_text',
                text: "Your Dashboard",
                emoji: true,
            },
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: 'Loading your dashboard...',
            },
        },
    ];

    await updateSlackHomeTab(userId, teamId, blocks);

    // TODO: Add logic here to fetch data from Greenhouse and update the blocks with the actual content

    return new NextResponse(JSON.stringify({ success: true }), { status: 200 });
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

    const data = await response.json();
    if (!data.ok) {
        throw new Error(`Failed to update Slack Home Tab: ${data.error}`);
    }

    return data;
}
