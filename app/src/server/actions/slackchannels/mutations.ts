import { db } from "@/server/db";
import { slackChannelsCreated } from "@/server/db/schema";

export async function saveSlackChannelCreatedToDB(
    slackChannelId: string,
    invitedUsers: any[],
    channelName: string,
    hiringroom: {
        id: string;
        slackChannelFormat: string | null;
    },
    orgID: string,
    greenhouseJobId: string, // Add greenhouseJobId to the parameters
    greenhouseCandidateId: string,
) {
    try {
        const insertData: any = {
            name: channelName,
            channelId: slackChannelId,
            isArchived: false,
            invitedUsers: invitedUsers,
            hiringroomId: hiringroom.id, // Extract hiringroom ID
            organizationId: orgID, // Save the organization ID
            createdAt: new Date(),
            ...(greenhouseJobId && { greenhouseJobId }),
            ...(greenhouseCandidateId && { greenhouseCandidateId }),
            ...(hiringroom.slackChannelFormat && {
                channelFormat: hiringroom.slackChannelFormat,
            }),
        };

        await db.insert(slackChannelsCreated).values(insertData);
    } catch (e) {
        throw new Error(`Error saving slack channel created: ${e}`);
    }
    return "success";
}
