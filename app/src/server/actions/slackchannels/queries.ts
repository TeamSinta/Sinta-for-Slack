import { db } from "@/server/db";
import { eq } from "drizzle-orm";

export async function fetchSlackChannelsByJobIDAndOrgID(
    jobId: string,
    orgID: string,
) {
    if (!jobId || !orgID) {
        throw new Error("Job ID or Organization ID is missing.");
    }

    // Query the slackChannelsCreated table for the first match based on jobId and orgID
    const slackChannel = await db.query.slackChannelsCreated.findFirst({
        where: (fields) =>
            eq(fields.greenhouseJobId, jobId) &&
            eq(fields.organizationId, orgID),
        columns: {
            channelId: true,
            hiringroomId: true,
        },
    });

    if (!slackChannel) {
        throw new Error(
            `No Slack channel found for Job ID: ${jobId} and Org ID: ${orgID}`,
        );
    }

    // Return the matching slack channel with hiring room ID
    return {
        slackChannelID: slackChannel.channelId,
        hiringRoomID: slackChannel.hiringroomId,
    };
}
