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
            greenhouse_api_token: organizations.greenhouse_api_token
        })
        .from(organizations)
        .where(eq(organizations.id, orgID))
        .execute();

    if (result && result.length > 0 && result[0]?.greenhouse_api_token) {
        return result[0].greenhouse_api_token;
    }

    return null;
}
