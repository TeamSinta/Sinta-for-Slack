"use server";

import { db } from "@/server/db";
import { organizations } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { getOrganizations } from "../organization/queries";

interface SlackTeamInfoResponse {
    ok: boolean;
    error?: string;
    name: string;
    team: {
        id: string;
        team: string;
        name: string;
        email_domain?: string;
        icon: {
            image_34: string;
            image_44: string;
            image_68: string;
            image_88: string;
            image_102: string;
            image_132: string;
            image_default: boolean;
        };
    };
}

export async function getAccessToken(teamId: string) {
    if (process.env.SLACK_OAUTH_TOKEN) {
        return process.env.SLACK_OAUTH_TOKEN;
    }

    // Correctly fetch the organization's slack access token using Drizzle ORM
    const organization = await db.query.organizations.findFirst({
        where: eq(organizations.slack_team_id, teamId),
        columns: {
            slack_access_token: true,
        },
    });

    return organization?.slack_access_token;
}

export async function setAccessToken(accessToken: string, teamId: string) {
    const { currentOrg } = await getOrganizations();

    const response = await fetch("https://slack.com/api/team.info", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    const slackResponse = (await response.json()) as SlackTeamInfoResponse;

    if (!slackResponse.ok) {
        throw new Error(`Failed to fetch team info: ${slackResponse.error}`);
    }

    if (!slackResponse.team) {
        throw new Error("Team data is missing in the response.");
    }
    console.log(accessToken);
    const result = await db
        .update(organizations)
        .set({
            slack_team_id: teamId,
            slack_access_token: accessToken,
        })
        .where(eq(organizations.id, currentOrg.id))
        .execute();

    return result ? "OK" : "Failed to update access token";
}

// export async function getChannel(teamId: string) {
//   // Assuming the slack_team_id uniquely identifies the team and slack_channel_id is stored in the same table
//   const organization = await db.query.organizations.findFirst({
//     where: (org) => org.slack_team_id.eq(teamId),
//     select: {
//       slack_channel_id: true // Select only the slack_channel_id
//     }
//   });

//   if (!organization) {
//     throw new Error("Team not found or channel ID not set.");
//   }

//   return organization?.slack_channel_id;
// }
