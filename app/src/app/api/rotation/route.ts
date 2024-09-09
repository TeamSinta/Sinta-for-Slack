import { refreshTokenIfNeeded } from "@/server/actions/slack/query";
import { db } from "@/server/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Cron job started: Refreshing Slack tokens");

    const organizations = await db.query.organizations.findMany();

    const results = [];

    // Loop through each organization and refresh their token if needed
    for (const organization of organizations) {
      const { slack_team_id, token_expiry, slack_refresh_token } = organization;

      // Skip organizations with missing Slack team ID or refresh token
      if (!slack_team_id || !slack_refresh_token) {
        continue;
      }

      if (token_expiry !== null) {
        const currentTime = Math.floor(Date.now() / 1000); // current time in seconds
        const isExpired = currentTime >= token_expiry;

        if (isExpired) {
          console.log(`Token expired for team ${slack_team_id}. Attempting to refresh...`);
          try {
            const newAccessToken = await refreshTokenIfNeeded(slack_team_id, token_expiry, slack_refresh_token);
            results.push({
              team_id: slack_team_id,
              status: 'success',
              message: `Token refreshed successfully for team ${slack_team_id}.`,
              newAccessToken,
            });
          } catch (refreshError) {
            console.error(`Failed to refresh token for team ${slack_team_id}:`, refreshError);
            results.push({
              team_id: slack_team_id,
              status: 'error',
              message: `Failed to refresh token for team ${slack_team_id}: ${(refreshError as Error).message}`,
            });
          }
        } else {
          console.log(`Token for team ${slack_team_id} is still valid.`);
          results.push({
            team_id: slack_team_id,
            status: 'not_expired',
            message: `Token for team ${slack_team_id} is still valid.`,
          });
        }
      } else {
        console.log(`No token expiry data available for team ${slack_team_id}.`);
        results.push({
          team_id: slack_team_id,
          status: 'no_expiry',
          message: `No token expiry data available for team ${slack_team_id}.`,
        });
      }
    }

    return NextResponse.json(
      {
        message: 'Slack token refresh process completed.',
        details: results,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error('Error during Slack token refresh cron job:', e);
    return NextResponse.json(
      {
        message: 'Error during Slack token refresh process.',
        error: (e as Error).message,
      },
      { status: 500 }
    );
  }
}
