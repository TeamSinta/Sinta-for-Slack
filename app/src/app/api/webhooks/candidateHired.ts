import { getHiringRoomById } from "@/server/actions/hiringrooms/queries";
import { getSlackTeamIDByHiringroomID } from "@/server/actions/slack/query";
import { fetchSlackChannelsByJobIDAndOrgID } from "@/server/actions/slackchannels/queries";
import { archiveSlackChannel } from "@/server/slack/core";
import { checkAutoArchiveAction } from "@/utils/hiring-rooms/automated-actions-processor";

export async function handleCandidateHired(data: any, orgID: string) {
    // Step 1: Extract the job data from the Greenhouse payload
    const jobData = data.payload.job;
    const jobId = jobData.id;

    console.log(`Handling candidate hired for Job ID: ${jobId} in Org: ${orgID}`);

    // Step 2: Fetch the Slack channel related to the jobId and orgID (returns only one channel)
    const slackChannel = await fetchSlackChannelsByJobIDAndOrgID(jobId, orgID);

    if (!slackChannel) {
        console.log("No Slack channel found for this job and organization.");
        return;
    }

    const hiringRoomID = slackChannel.hiringRoomID;

    if (!hiringRoomID) {
      console.log(`Hiring room with ID ${hiringRoomID} not found.`);
      return;
  }

    // Step 3: Fetch the hiring room data by ID
    const hiringRoom = await getHiringRoomById(hiringRoomID);

    if (!hiringRoom) {
        console.log(`Hiring room with ID ${hiringRoomID} not found.`);
        return;
    }

    // Step 4: Check if auto-archive action is enabled in the hiring room's actions
    const autoArchiveEnabled = checkAutoArchiveAction(hiringRoom.actions);

    if (autoArchiveEnabled) {
        console.log(`Auto-archive is enabled for Hiring Room ID: ${hiringRoomID}, proceeding to archive channel...`);
        const slackTeamID = await getSlackTeamIDByHiringroomID(hiringRoom.id);

        // Step 5: Archive the Slack channel using its ID
        try {
            await archiveSlackChannel(slackChannel.slackChannelID, slackTeamID);
            console.log(`Successfully archived Slack channel with ID: ${slackChannel.slackChannelID}`);
        } catch (error) {
            console.error(`Failed to archive Slack channel: ${slackChannel.slackChannelID}`, error);
        }
    } else {
        console.log(`Auto-archive is not enabled for Hiring Room ID: ${hiringRoomID}.`);
    }

    console.log("Candidate Hired Webhook processing complete.");
}
