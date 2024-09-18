"use server";

import { db } from "@/server/db";
import { organizations } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { getOrganizations } from "../organization/queries";
import MixpanelServer from "@/server/mixpanel";
import { getServerAuthSession } from "@/server/auth";
import crypto from "crypto";

export async function setGreenhouseDetails(
    subDomain: string,
    API_TOKEN: string,
) {
    const { currentOrg } = await getOrganizations();
    const orgID = currentOrg.id;
    const result = await db
        .update(organizations)
        .set({
            greenhouse_subdomain: subDomain,
            greenhouse_api_token: API_TOKEN,
        })
        .where(eq(organizations.id, orgID))
        .execute();
    if (result) {
        const session = await getServerAuthSession();
        MixpanelServer.track("Integration Connected", {
            user_id: session?.user.id,
            organization_id: orgID,
            integration_id: 2,
            integration_name: "Greenhouse",
            integration_type: "ATS",
        });
    }
    return result ? "OK" : "Failed to update details";
}

const generateSecretKey = () => {
    return crypto.randomBytes(16).toString("hex");
};

// Separate function to add the secret key to the org table
export async function addSecretKeyToOrg() {
    // Get the current organization
    const { currentOrg } = await getOrganizations();
    const orgID = currentOrg.id;

    // Generate the secret key
    const secretKey = generateSecretKey();

    // Update the org with the new secret key
    const result = await db
        .update(organizations)
        .set({
            greenhouse_secret_key: secretKey, // Assuming the column name is greenhouse_secret_key
        })
        .where(eq(organizations.id, orgID))
        .execute();

    // Return the result and secret key
    return result ? { status: "OK", secretKey } : { status: "Failed" };
}
