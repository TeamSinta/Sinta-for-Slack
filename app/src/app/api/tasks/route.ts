import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json();
    console.log("RECEIVED TASK", body);
    return NextResponse.json(body, { status: 200 });
}
