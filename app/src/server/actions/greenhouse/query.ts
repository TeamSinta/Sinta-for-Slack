/* eslint-disable @typescript-eslint/no-unsafe-assignment */

"use server";

import { db } from "@/server/db";
import { organizations } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { getOrganizations } from "../organization/queries";

export async function getGreenhouseApiToken(): Promise<string | null> {
    const { currentOrg } = await getOrganizations();
    const orgID = currentOrg.id;

    const result = await db
        .select({
            greenhouse_api_token: organizations.greenhouse_api_token,
        })
        .from(organizations)
        .where(eq(organizations.id, orgID))
        .execute();

    if (result && result.length > 0 && result[0]?.greenhouse_api_token) {
        return result[0].greenhouse_api_token;
    }

    return null;
}

export async function checkIfSecretKeyExists(orgID: string) {
    const result = await db
        .select({
            greenhouse_secret_key: organizations.greenhouse_secret_key, // Selecting the correct column
        })
        .from(organizations)
        .where(eq(organizations.id, orgID))
        .execute();

    if (result && result.length > 0 && result[0]?.greenhouse_secret_key) {
        return { exists: true, secretKey: result[0].greenhouse_secret_key };
    }

    return { exists: false };
}

export async function getSecretKeyForOrg(
    orgID: string,
): Promise<string | null> {
    const result = await db
        .select({
            greenhouse_secret_key: organizations.greenhouse_secret_key,
        })
        .from(organizations)
        .where(eq(organizations.id, orgID))
        .execute();

    // Return the secret key if it exists, otherwise null
    return result.length > 0
        ? (result[0]?.greenhouse_secret_key ?? null)
        : null;
}
