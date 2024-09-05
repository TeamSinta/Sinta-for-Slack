"use server";

import { db } from "@/server/db";
import { organizations } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { getOrganizations } from "../organization/queries";
import MixpanelServer from "@/server/mixpanel";
import { getServerAuthSession } from "@/server/auth";

export async function setGreenhouseDetails(
    subDomain: string,
    API_TOKEN: string,
) {
    const { currentOrg } = await getOrganizations();
    const session = await getServerAuthSession();
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
