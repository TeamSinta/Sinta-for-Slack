import {
    createSlackChannel,
    inviteUsersToChannel,
    sendAndPinSlackMessage,
} from "@/server/slack/core";
import {
    buildSlackChannelName,
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

type DataExtractor = (data: any) => {
    title?: string;
    department?: string;
    location?: string;
    employment_type?: string;
    recruiter?: string;
    hiring_managers?: string;
};

// Define the extractors for different object types
const hiringRoomDataExtractors: Record<string, DataExtractor> = {
    job: (data: any) => ({
        title: data.name,
        department: data.departments?.[0]?.name,
        location: data.offices?.[0]?.location,
        employment_type: data.custom_fields?.employment_type?.value,
        recruiter: data.hiring_team?.recruiters?.[0]?.user_id,
        hiring_managers: data.hiring_team?.hiring_managers?.[0]?.user_id,
    }),
    candidate: (data: any) => ({
        title: data.jobs[0]?.name,
        department: data.jobs[0]?.departments?.[0]?.name,
        location: data.jobs[0]?.offices?.[0]?.location,
        employment_type: data.jobs[0]?.custom_fields?.employment_type?.value,
        recruiter: data.candidate.recruiter?.name,
        hiring_managers: data.hiring_team?.hiring_managers?.[0]?.user_id,
    }),
    // Add more objectTypes as needed...
};

export async function initializeHiringRoomChannel(
    hiringRoom: any,
    slackTeamID: string,
    data: any,
    orgID: string,
    roomType: "candidate" | "job" = "job",
) {
    if (!hiringRoom.slackChannelFormat) {
        console.log(
            "No Slack Channel Format Found for Hiring Room",
            hiringRoom.id,
        );
        return;
    }

    let channelName = "";
    if (roomType === "job") {
        channelName = buildSlackChannelNameForJob(
            hiringRoom.slackChannelFormat,
            data, // Use the job data directly from the payload
        );
    } else if (roomType === "candidate") {
        channelName = buildSlackChannelName(
            hiringRoom.slackChannelFormat,
            data,
            "candidate",
        );
    }

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

        const extractData = hiringRoomDataExtractors[roomType];
        if (!extractData) throw new Error(`Unsupported room type: ${roomType}`);

        const {
            title,
            department,
            location,
            employment_type,
            hiring_managers,
            recruiter,
        } = extractData(data);

        const { messageBlocks } = await formatOpeningMessageSlack(
            hiringRoom,
            title,
            department,
            location,
            employment_type,
            recruiter,
            hiring_managers,
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
            roomType === "job" ? data.id : data?.jobs?.[0]?.id,
            roomType === "candidate" ? data?.candidate?.id : null,
        );
        console.log(`Slack Channel ${channelId} saved to Database.`);
    }
}
