import { fetchHireRoomsByObjectFieldAndAlertType } from "@/server/actions/hiringrooms/queries";
import { getSlackTeamIDByHiringroomID } from "@/server/actions/slack/query";
import { fetchJob } from "@/server/greenhouse/core";
import {
    getAttributeValue,
    initializeHiringRoomChannel,
} from "@/utils/hiring-rooms/event-processing";
import { checkConditions } from "@/utils/workflows";

export async function handleJobPostCreatedHiringRoom(data: any, orgID: string) {
    const jobPostData = data.payload;
    const jobId = jobPostData.job_id;
    if (!jobId) {
        console.log("No job ID found in payload.");
        return;
    }

    const jobData = await fetchJob(jobId as string);

    if (!jobData || Object.keys(jobData).length === 0) {
        console.log("Job not found.");
        return;
    }

    const hiringRooms = await fetchHireRoomsByObjectFieldAndAlertType(
        orgID,
        "Jobs",
        "Job Post Created",
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
            await initializeHiringRoomChannel(
                hiringroom,
                slackTeamID,
                jobData,
                orgID,
            );
        } else {
            console.log(
                `Job post "${jobData.name}" did not meet conditions for hiring room "${hiringroom.id}".`,
            );
        }
    }
}
