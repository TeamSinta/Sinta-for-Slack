import { fetchHireRoomsByObjectFieldAndAlertType } from "@/server/actions/hiringrooms/queries";
import { getSlackTeamIDByHiringroomID } from "@/server/actions/slack/query";
import {
    getAttributeValue,
    initializeHiringRoomChannel,
} from "@/utils/hiring-rooms/event-processing";
import { checkConditions } from "@/utils/workflows";

export async function handleJobApprovedHiringRooms(data: any, orgID: string) {
    const jobData = data.payload.job;

    const hiringRooms = await fetchHireRoomsByObjectFieldAndAlertType(
        orgID,
        "Jobs",
        "Job Approved",
    );

    if (!hiringRooms.length) {
        console.log("No hiring rooms found for this event.");
        return;
    }

    for (const hiringroom of hiringRooms) {
        const slackTeamID = await getSlackTeamIDByHiringroomID(hiringroom.id);

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
}
