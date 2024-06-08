"use server";

import { db } from "@/server/db";
import { organizations } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { getOrganizations } from "../organization/queries";

export async function setGreenhouseToken(API_TOKEN: string) {
    const { currentOrg } = await getOrganizations();
    const orgID = currentOrg.id;
    const result = await db
        .update(organizations)
        .set({
            greenhouse_api_token: API_TOKEN,
        })
        .where(eq(organizations.id, orgID))
        .execute();
    return result ? "OK" : "Failed to update access token";
}
