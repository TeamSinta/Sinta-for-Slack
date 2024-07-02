/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { NextResponse } from "next/server";
import { getWorkflows } from "@/server/actions/workflows/queries";
import {
    filterDataWithConditions,
    filterStuckinStageDataConditions,
} from "@/server/greenhouse/core";
import { filterProcessedForSlack } from "@/lib/slack";
import {
    sendSlackButtonNotification,
    sendSlackNotification,
} from "@/server/slack/core";
import { customFetch } from "@/utils/fetch";
import { getSlackTeamIDByWorkflowID } from "@/server/actions/slack/query";
import { stuckInStage } from "../cron/route";

// Define the GET handler for the route
export async function GET() {
    try {
        console.log('pre stuck in stage')
        stuckInStage()
        // console.log('go bucks')
        return NextResponse.json({ message: "Go Pack Go" }, { status: 200 });
    } catch (error: unknown) {
        console.error("Failed to process workflows:", error);
        return NextResponse.json({ error: "Failed to process workflows", details: (error as Error).message }, { status: 500 });
    }
}
