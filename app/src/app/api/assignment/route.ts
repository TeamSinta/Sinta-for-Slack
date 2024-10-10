import { type NextRequest, NextResponse } from "next/server";
import { handleIndividualHiringroom } from "../cron/route";
import { setAccessToken } from "@/server/actions/slack/query";
import { siteUrls } from "@/config/urls";

export async function POST(request: NextRequest) {
    console.log("in post route hiring room");
    try {
        const contentType = request.headers.get("content-type");
        if (contentType?.includes("application/json")) {
            const data = await request.json();
            // console.log('data from hiring room - ? ',data)
            // return
            const hiringRoomReturn = await handleIndividualHiringroom(data);

            return new NextResponse(
                // JSON.stringify({status: 200, data: "", headers: { "Content-Type": "application/json" },}));
                JSON.stringify({
                    status: 200,
                    data: hiringRoomReturn,
                    headers: { "Content-Type": "application/json" },
                }),
            );
            // return handleJsonPost(data);
        } else if (contentType?.includes("application/x-www-form-urlencoded")) {
            // const text = await request.text();
            // const params = new URLSearchParams(text);
            // const payloadRaw = params.get("payload");
            // if (payloadRaw) {
            //     return handleSlackInteraction(JSON.parse(payloadRaw));
            // } else {
            //     return new NextResponse(
            //         JSON.stringify({
            //             error: "Unrecognized form-urlencoded request",
            //         }),
            //         {
            //             status: 400,
            //             headers: { "Content-Type": "application/json" },
            //         },
            //     );
            // }
        }

        return new NextResponse(JSON.stringify({ success: "go bucks" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (e) {
        return new NextResponse(
            JSON.stringify({ error: "Unsupported Content Type - " + e }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
        return new NextResponse(
            JSON.stringify({ message: "Code parameter is missing." }),
            { status: 400 },
        );
    }

    const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;
    const redirectUri = process.env.NEXTAUTH_URL + "api/slack";

    // console.log('json secret - ',json)

    if (!clientId || !clientSecret) {
        return new NextResponse(
            JSON.stringify({
                message: "Slack client ID or secret is undefined.",
            }),
            { status: 500 },
        );
    }

    try {
        const url = `https://slack.com/api/oauth.v2.access?client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
        const response = await fetch(url, { method: "POST" });
        const json = await response.json();
        if (
            json.access_token &&
            json.refresh_token &&
            json.expires_in &&
            json.team?.id
        ) {
            // Calculate the expiry timestamp
            const expiresAt = Math.floor(Date.now() / 1000) + json.expires_in;

            // Store access token, refresh token, and expiry time securely
            const updateResponse = await setAccessToken(
                json.access_token,
                json.team.id,
                json.refresh_token,
                expiresAt,
            );
            console.log("Access token updated:", updateResponse);
            if (updateResponse === "OK") {
                const url = `${siteUrls.teamsinta}/success/${json.team.id}`;
                return NextResponse.redirect(url);
            } else {
                return new NextResponse(
                    JSON.stringify({
                        message: "Failed to update access token.",
                    }),
                    { status: 500 },
                );
            }
        } else {
            return new NextResponse(
                JSON.stringify({
                    message:
                        "No access token, refresh token, or team id found in response from Slack's OAuth.",
                }),
                { status: 500 },
            );
        }
    } catch (err) {
        console.error(err);
        return new NextResponse(
            JSON.stringify({ message: "An unknown error occurred." }),
            { status: 500 },
        );
    }
}
