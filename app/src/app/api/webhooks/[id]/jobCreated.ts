import { formatOpeningMessageSlackx } from "@/lib/slack";
import { fetchHireRoomsByObjectFieldAndAlertType } from "@/server/actions/hiringrooms/queries";
import { getSlackTeamIDByHiringroomID } from "@/server/actions/slack/query";
import { saveSlackChannelCreatedToDB } from "@/server/actions/slackchannels/mutations";
import {
    createSlackChannel,
    inviteUsersToChannel,
    sendAndPinSlackMessage,
} from "@/server/slack/core";
import {
    buildSlackChannelNameForJob,
    getSlackUsersFromRecipient,
} from "@/utils/hiring-rooms/rooms-formatter";

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
        const jobFitsConditions = true; // Adjust this to real condition checking

        if (jobFitsConditions) {
            // Step 5: Build the Slack channel name using the job data and the hiring room format
            if (!hiringroom.slackChannelFormat) {
                console.log(
                    "No Slack Channel Format Found for Hiring Room",
                    hiringroom.id,
                );
                return;
            }

            const channelName = buildSlackChannelNameForJob(
                hiringroom.slackChannelFormat,
                jobData, // Use the job data directly from the payload
            );

            // Step 6: Get Slack users from the hiring room recipients
            const slackUserIds = getSlackUsersFromRecipient(
                hiringroom.recipient as Recipient,
            );

            // Step 7: Create the Slack channel
            const channelId = await createSlackChannel(
                channelName,
                slackTeamID,
            );
            console.log(
                `Slack Channel Created with ID: ${channelId} for Hiring Room ${hiringroom.id}`,
            );

            if (channelId) {
                // Step 8: Invite users to the Slack channel
                await inviteUsersToChannel(
                    channelId,
                    slackUserIds,
                    slackTeamID,
                );

                // Step 9: Format the message for Slack using the job data
                console.log(
                    `Formatting Opening Message for Slack Channel ${channelId}`,
                );
                const { messageBlocks } = await formatOpeningMessageSlackx(
                    hiringroom,
                    jobData,
                );

                // Step 10: Send and pin the message in the Slack channel
                console.log(
                    `Sending and Pinning Message to Slack Channel ${channelId}`,
                );
                await sendAndPinSlackMessage(
                    channelId,
                    slackTeamID,
                    messageBlocks,
                );

                // Step 11: Save the created Slack channel information to the database
                console.log(`Saving Slack Channel ${channelId} to Database`);
                await saveSlackChannelCreatedToDB(
                    channelId,
                    slackUserIds,
                    channelName,
                    hiringroom,
                    orgID,
                    jobData.id,
                );
                console.log(`Slack Channel ${channelId} saved to Database.`);
            }
        } else {
            console.log(
                `Job "${jobData.name}" did not meet conditions for hiring room "${hiringroom.id}".`,
            );
        }
    }

    console.log("Job Created Webhook processing complete.");
}
