/* eslint-disable @typescript-eslint/no-unsafe-assignment */

"use server";

import { db } from "@/server/db";
import { organizations } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function getAccessToken(teamId: string): Promise<string> {
    if (!teamId) {
        throw new Error("No Slack team ID provided.");
    }

    // Fetch organization's Slack token details using the provided team ID
    const organization = await db.query.organizations.findFirst({
        where: eq(organizations.slack_team_id, teamId),
        columns: {
            slack_access_token: true,
            slack_refresh_token: true, // Now also fetching the refresh token
            token_expiry: true, // Fetching the token expiry time
        },
    });

    if (!organization) {
        throw new Error("Organization not found or no access token available.");
    }

    // Check if token_expiry is null or the access token is expired
    if (
        !organization.slack_access_token ||
        organization.token_expiry === null ||
        Date.now() >= (organization.token_expiry ?? 0) * 1000
    ) {
        return await refreshTokenIfNeeded(
            teamId,
            organization.token_expiry!,
            organization.slack_refresh_token!,
        ); // This will refresh the token if necessary
    }

    return organization.slack_access_token; // Return the existing access token if it's still valid
}

export async function refreshTokenIfNeeded(
    teamId: string,
    token_expiry: number,
    slack_refresh_token: string,
): Promise<string> {
    const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("Slack client ID or secret is undefined.");
    }

    if (Date.now() >= token_expiry * 1000) {
        const response = await fetch("https://slack.com/api/oauth.v2.access", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&refresh_token=${encodeURIComponent(slack_refresh_token)}&grant_type=refresh_token`,
        });
        const data: {
            ok: boolean;
            access_token?: string;
            refresh_token?: string;
            expires_in?: number;
            error?: string;
        } = await response.json();
        console.log("REFRESHING", data);

        if (
            data.ok &&
            data.access_token &&
            data.refresh_token &&
            data.expires_in
        ) {
            const expiresAt = Math.floor(Date.now() / 1000) + data.expires_in;
            await setAccessToken(
                teamId,
                data.access_token,
                data.refresh_token,
                expiresAt,
            );
            return data.access_token;
        } else {
            throw new Error(
                "Failed to refresh access token" +
                    (data.error ? `: ${data.error}` : ""),
            );
        }
    }

    // Assuming there's a way to fetch the current accessToken if not expired
    const currentAccessToken = ""; // Placeholder for actual access token retrieval logic
    return currentAccessToken;
}

export async function setAccessToken(
    accessToken: string,
    teamId: string,
    refreshToken: string,
    expiration: number,
) {
    const result = await db
        .update(organizations)
        .set({
            slack_team_id: teamId,
            slack_access_token: accessToken,
            slack_refresh_token: refreshToken,
            token_expiry: expiration,
        })
        .where(eq(organizations.slack_team_id, teamId))
        .execute();

    return result ? "OK" : "Failed to update access token";
}
