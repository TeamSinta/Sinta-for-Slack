import { getOrganizations } from "@/server/actions/organization/queries";
import { getAccessToken } from "@/server/actions/slack/query";
import { db } from "@/server/db";
import { membersToOrganizations } from "@/server/db/schema";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
    const { body, user } = await request.json();
    if (!body || !user) return NextResponse.json({}, { status: 400 });
    const userId = user?.id;

    const { currentOrg } = await getOrganizations();
    const teamId = currentOrg.slack_team_id;
    if (!teamId || !userId) return NextResponse.json({}, { status: 500 });

    const accessToken = await getAccessToken(teamId);

    const dbUser = await db.query.membersToOrganizations.findFirst({
        where: and(
            eq(membersToOrganizations.memberId, userId),
            eq(membersToOrganizations.organizationId, currentOrg.id),
        ),
    });

    const slackUserId = dbUser?.slack_user_id;
    console.log("body", JSON.stringify(body, null, 2));
    const response = await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            attachments: body.attachments,
            channel: slackUserId,
        }),
    });

    if (response.ok) return NextResponse.json({});
    return NextResponse.json({}, { status: 500 });
}
