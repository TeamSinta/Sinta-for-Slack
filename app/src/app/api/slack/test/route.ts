import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { body, url } = await request.json();
    if (!body || !url) return NextResponse.json({}, { status: 400 });
    console.log(JSON.stringify(body));
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (response.ok) return NextResponse.json({});
    return NextResponse.json({}, { status: 500 });
}
