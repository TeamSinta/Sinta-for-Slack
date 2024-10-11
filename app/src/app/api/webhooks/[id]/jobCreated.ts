import { formatOpeningMessageSlack } from "@/lib/slack";
import { fetchHireRoomsByObjectFieldAndAlertType } from "@/server/actions/hiringrooms/queries";
import { getSlackTeamIDByHiringroomID } from "@/server/actions/slack/query";
import { saveSlackChannelCreatedToDB } from "@/server/actions/slackchannels/mutations";
import {
    createSlackChannel,
    inviteUsersToChannel,
    sendAndPinSlackMessage,
} from "@/server/slack/core";
import {
    getAttributeValue,
    initializeHiringRoomChannel,
} from "@/utils/hiring-rooms/event-processing";
import {
    buildSlackChannelNameForJob,
    getSlackUsersFromRecipient,
} from "@/utils/hiring-rooms/rooms-formatter";
import { checkConditions } from "@/utils/workflows";

interface Recipient {
    recipients: any[]; // Adjust the type of the elements inside the array as needed
}
export async function handleJobCreated(data: any, orgID: string) {
    // Step 1: Extract the job data from the Greenhouse payload
    const jobData = data.payload.job;

    // Step 2: Fetch the relevant hiring rooms for Jobs and Job Created event
    const hiringRooms = await fetchHireRoomsByObjectFieldAndAlertType(
        orgID,
        "Jobs",
        "Job Created",
    );

    if (!hiringRooms.length) {
        console.log("No hiring rooms found for this event.");
        return;
    }

    // Step 3: Loop through each hiring room and process conditions
    for (const hiringroom of hiringRooms) {
        const slackTeamID = await getSlackTeamIDByHiringroomID(hiringroom.id);

        // Step 4: Check if the job data meets the conditions for the hiring room
        const jobFitsConditions = checkConditions(
            jobData,
            hiringroom.conditions,
            getAttributeValue,
        );

        if (jobFitsConditions) {
            await initializeHiringRoomChannel(hiringroom, slackTeamID, jobData);
        } else {
            console.log(
                `Job "${jobData.name}" did not meet conditions for hiring room "${hiringroom.id}".`,
            );
        }
    }

    console.log("Job Created Webhook processing complete.");
}
