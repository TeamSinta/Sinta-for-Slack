// /app/api/sidebar-data/route.ts (or in /pages/api/sidebar-data.ts if you're using the pages directory)
import { getUser } from "@/server/auth";
import { getOrganizations } from "@/server/actions/organization/queries";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const user = await getUser();
        const { currentOrg, userOrgs } = await getOrganizations();

        return NextResponse.json({ user, currentOrg, userOrgs });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch sidebar data" },
            { status: 500 }
        );
    }
}
