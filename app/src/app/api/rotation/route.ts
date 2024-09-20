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
              const twoHoursInSeconds = 7200; // 2 hours in seconds
              const isExpiringSoon = token_expiry - currentTime <= twoHoursInSeconds;

              if (isExpiringSoon) {
                  console.log(`Token is expiring soon. Attempting to refresh...`);
                  try {
                      const newAccessToken = await refreshTokenIfNeeded(
                          slack_team_id,
                          token_expiry,
                          slack_refresh_token,
                      );
                      results.push({
                          status: "success",
                          message: `Token refreshed successfully.`,
                          newAccessToken,
                      });
                  } catch (refreshError) {
                      console.error(`Failed to refresh token:`, refreshError);
                      results.push({
                          status: "error",
                          message: `Failed to refresh token: ${(refreshError as Error).message}`,
                      });
                  }
              } else {
                  console.log(`Token is still valid and not expiring soon.`);
                  results.push({
                      status: "not_expiring_soon",
                      message: `Token is still valid and not expiring soon.`,
                  });
              }
          } else {
              console.log(`No token expiry data available.`);
              results.push({
                  status: "no_expiry",
                  message: `No token expiry data available.`,
              });
          }
      }

      return NextResponse.json(
          {
              message: "Slack token refresh process completed.",
              details: results,
          },
          { status: 200 },
      );
  } catch (e) {
      console.error("Error during Slack token refresh cron job:", e);
      return NextResponse.json(
          {
              message: "Error during Slack token refresh process.",
              error: (e as Error).message,
          },
          { status: 500 },
      );
  }
}
