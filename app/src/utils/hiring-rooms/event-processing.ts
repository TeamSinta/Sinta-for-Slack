import {
    createSlackChannel,
    inviteUsersToChannel,
    sendAndPinSlackMessage,
} from "@/server/slack/core";
import {
    buildSlackChannelNameForJob,
    getSlackUsersFromRecipient,
} from "./rooms-formatter";
import { formatOpeningMessageSlack } from "@/lib/slack";
import { saveSlackChannelCreatedToDB } from "@/server/actions/slackchannels/mutations";

interface Recipient {
    recipients: any[]; // Adjust the type of the elements inside the array as needed
}

export function getAttributeValue(object: any, attributePath: string) {
    const keys = attributePath.split(".");

    let currentObject = object;

    for (let key of keys) {
        if (key.endsWith("[]")) {
            // Handle array access
            const arrayKey = key.slice(0, -2); // Strip "[]"
            if (!Array.isArray(currentObject[arrayKey])) {
                return undefined; // Return undefined if not an array
            }
            currentObject = currentObject[arrayKey].map((item) =>
                getAttributeValue(
                    item,
                    keys.slice(keys.indexOf(key) + 1).join("."),
                ),
            );
            return currentObject;
        }

        if (currentObject === undefined || currentObject === null) {
            return undefined; // Return undefined if any part of the path is invalid
        }

        currentObject = currentObject[key];
    }

    return currentObject;
}

export async function initializeHiringRoomChannel(
    hiringRoom: any,
    slackTeamID: string,
    jobData: any,
    orgID: string,
) {
    if (!hiringRoom.slackChannelFormat) {
        console.log(
            "No Slack Channel Format Found for Hiring Room",
            hiringRoom.id,
        );
        return;
    }

    const channelName = buildSlackChannelNameForJob(
        hiringRoom.slackChannelFormat,
        jobData, // Use the job data directly from the payload
    );

    // Step 6: Get Slack users from the hiring room recipients
    const slackUserIds = getSlackUsersFromRecipient(
        hiringRoom.recipient as Recipient,
    );

    // Step 7: Create the Slack channel
    const channelId = await createSlackChannel(channelName, slackTeamID);
    console.log(
        `Slack Channel Created with ID: ${channelId} for Hiring Room ${hiringRoom.id}`,
    );

    if (channelId) {
        // Step 8: Invite users to the Slack channel
        await inviteUsersToChannel(channelId, slackUserIds, slackTeamID);

        // Step 9: Format the message for Slack using the job data
        console.log(
            `Formatting Opening Message for Slack Channel ${channelId}`,
        );
        const { messageBlocks } = await formatOpeningMessageSlack(
            hiringRoom,
            jobData,
        );

        // Step 10: Send and pin the message in the Slack channel
        console.log(
            `Sending and Pinning Message to Slack Channel ${channelId}`,
        );
        await sendAndPinSlackMessage(channelId, slackTeamID, messageBlocks);

        // Step 11: Save the created Slack channel information to the database
        console.log(`Saving Slack Channel ${channelId} to Database`);
        await saveSlackChannelCreatedToDB(
            channelId,
            slackUserIds,
            channelName,
            hiringRoom,
            orgID,
            jobData.id,
        );
        console.log(`Slack Channel ${channelId} saved to Database.`);
    }
}
