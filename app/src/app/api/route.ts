import { fetchSlackUserFromGreenhouseId } from "@/lib/slack";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const data = await fetchSlackUserFromGreenhouseId("4160321008");
    return NextResponse.json(data);
}

export const dynamic = "force-dynamic";
