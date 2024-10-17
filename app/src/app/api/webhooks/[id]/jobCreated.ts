import { fetchHireRoomsByObjectFieldAndAlertType } from "@/server/actions/hiringrooms/queries";
import { getSlackTeamIDByHiringroomID } from "@/server/actions/slack/query";
import {
    getAttributeValue,
    initializeHiringRoomChannel,
} from "@/utils/hiring-rooms/event-processing";
import { checkConditions } from "@/utils/workflows";

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
            hiringroom.conditions as any[],
            getAttributeValue,
        );

        if (jobFitsConditions) {
            await initializeHiringRoomChannel(
                hiringroom,
                slackTeamID,
                jobData,
                orgID,
            );
        } else {
            console.log(
                `Job "${jobData.name}" did not meet conditions for hiring room "${hiringroom.id}".`,
            );
        }
    }

    console.log("Job Created Webhook processing complete.");
}
