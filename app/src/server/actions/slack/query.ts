/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use server";
import { db } from "@/server/db";
import {
    organizations,
    workflows,
    hiringrooms,
    membersToOrganizations,
} from "@/server/db/schema";
import { and, eq, type SQLWrapper } from "drizzle-orm";
import { getOrganizations } from "../organization/queries";

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
    // console.log('get Access token - ')

    // Check if token_expiry is null or the access token is expired
    if (
        !organization.slack_access_token ||
        Date.now() >= (organization.token_expiry ?? 0) * 1000
    ) {
        console.log("refresh token - ", organization);
        console.log("refresh token - team id - ", teamId);
        const refreshToken = await refreshTokenIfNeeded(
            teamId,
            organization.token_expiry!,
            organization.slack_refresh_token!,
        ); // This will refresh the token if necessary
        return refreshToken;
    }

    return organization.slack_access_token;
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
        if (
            data.ok &&
            data.access_token &&
            data.refresh_token &&
            data.expires_in
        ) {
            const expiresAt = Math.floor(Date.now() / 1000) + data.expires_in;
            await setAccessToken(
                data.access_token,
                teamId,
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
    const { currentOrg } = await getOrganizations();
    const orgID = currentOrg.id;
    const result = await db
        .update(organizations)
        .set({
            slack_team_id: teamId,
            slack_access_token: accessToken,
            slack_refresh_token: refreshToken,
            token_expiry: expiration,
        })
        .where(eq(organizations.id, orgID))
        .execute();

    return result ? "OK" : "Failed to update access token";
}

export async function checkForSlackTeamIDConflict(teamId: string | SQLWrapper) {
    const existingOrg = await db.query.organizations.findFirst({
        where: eq(organizations.slack_team_id, teamId),
        columns: {
            id: true,
        },
    });
    const { currentOrg } = await getOrganizations();
    return existingOrg && existingOrg.id !== currentOrg.id;
}

export async function getSlackTeamIDByWorkflowID(
    workflowId: string,
): Promise<string> {
    if (!workflowId) {
        throw new Error("No workflow ID provided.");
    }

    // Fetch workflow details using the provided workflow ID
    const workflow = await db.query.workflows.findFirst({
        where: eq(workflows.id, workflowId),
        columns: {
            organizationId: true,
        },
    });

    if (!workflow) {
        throw new Error("Workflow not found.");
    }

    // Fetch organization's Slack team ID using the organization ID from the workflow
    const organization = await db.query.organizations.findFirst({
        where: eq(organizations.id, workflow.organizationId),
        columns: {
            slack_team_id: true,
        },
    });

    if (!organization) {
        throw new Error("Organization not found.");
    }

    return organization.slack_team_id!;
}

export async function getSlackTeamIDByHiringroomID(
    hiringroomId: string,
): Promise<string> {
    if (!hiringroomId) {
        throw new Error("No hiringroom ID provided.");
    }

    // Fetch hiringroom details using the provided hiringroom ID
    const hiringroom = await db.query.hiringrooms.findFirst({
        where: eq(hiringrooms.id, hiringroomId),
        columns: {
            organizationId: true,
        },
    });

    if (!hiringroom) {
        throw new Error("Hiringroom not found.");
    }

    // Fetch organization's Slack team ID using the organization ID from the hiringroom
    const organization = await db.query.organizations.findFirst({
        where: eq(organizations.id, hiringroom.organizationId),
        columns: {
            slack_team_id: true,
        },
    });

    if (!organization) {
        throw new Error("Organization not found.");
    }

    return organization.slack_team_id!;
}

export async function isUserMemberOfOrg({
    slackUserId,
    slackTeamId,
}: {
    slackUserId: string;
    slackTeamId: string;
}): Promise<boolean> {
    // Step 1: Retrieve the organization based on the slack_team_id
    const organization = await db.query.organizations.findFirst({
        where: eq(organizations.slack_team_id, slackTeamId),
    });

    if (!organization) {
        return false; // Organization not found
    }

    // Step 2: Check if the user is a member of the found organization
    const member = await db.query.membersToOrganizations.findFirst({
        where: and(
            eq(membersToOrganizations.slack_user_id, slackUserId),
            eq(membersToOrganizations.organizationId, organization.id),
        ),
    });

    return !!member; // Return true if the user is a member, false otherwise
}
