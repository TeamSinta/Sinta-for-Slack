import { getOrganizations } from "@/server/actions/organization/queries";
import { getAccessToken } from "@/server/actions/slack/query";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { body, url } = await request.json();
    if (!body || !url) return NextResponse.json({}, { status: 400 });
    const user = await getServerSession();
    const id = user?.user.id;
    const { currentOrg } = await getOrganizations();
    const teamId = currentOrg.slack_team_id;
    if (!teamId) return NextResponse.json({}, { status: 500 });
    const accessToken = await getAccessToken(teamId);

    const response = await fetch("https://slack.com/api/conversations.list", {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            Authorization: `Bearer ${accessToken}`,
        },
    });
    const data = await response.json();
    console.log(data);
    // console.log(JSON.stringify(body));
    // const response = await fetch(url, {
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(body),
    // });

    if (response.ok) return NextResponse.json({});
    return NextResponse.json({}, { status: 500 });
}
