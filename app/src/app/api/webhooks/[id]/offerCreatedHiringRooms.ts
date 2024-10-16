import { fetchHireRoomsByObjectFieldAndAlertType } from "@/server/actions/hiringrooms/queries";
import { getSlackTeamIDByHiringroomID } from "@/server/actions/slack/query";
import {
    fetchApplicationDetails,
    fetchCandidateDetails,
    fetchJob,
} from "@/server/greenhouse/core";
import {
    getAttributeValue,
    initializeHiringRoomChannel,
} from "@/utils/hiring-rooms/event-processing";
import { checkConditions } from "@/utils/workflows";

export async function handleOfferCreatedHiringRooms(data: any, orgID: string) {
    let offer = data.payload.offer;
    // This payload only includes data associated with offer (application, candidate, and job information must be fetched)

    if (!offer?.application_id) {
        console.log("No application ID found in payload.");
        return;
    }

    const application = await fetchApplicationDetails(offer.application_id);
    if (!application?.candidate_id) {
        console.log("Could not fetch application details.", application);
        return;
    }

    // Fetch candidate and job details concurrently
    const candidate = await fetchCandidateDetails(application.candidate_id);
    // Job is not used (maybe it can be used in the future)
    // const [candidate, job] = await Promise.all([
    //     fetchCandidateDetails(application.candidate_id),
    //     fetchJob(application.jobs[0].id),
    // ]);

    if (!candidate) {
        console.log("Could not fetch candidate or job details.");
        return;
    }

    // Make the object fit the format of the candidates_attributes.json file
    const payload = { ...offer, ...application, candidate };

    const hiringRooms = await fetchHireRoomsByObjectFieldAndAlertType(
        orgID,
        "Candidates",
        "Offer Created",
    );

    if (!hiringRooms.length) {
        console.log("No hiring rooms found for this event.");
        return;
    }
    for (const hiringroom of hiringRooms) {
        const slackTeamID = await getSlackTeamIDByHiringroomID(hiringroom.id);

        const conditionsMet = checkConditions(
            payload,
            hiringroom.conditions as any[],
            getAttributeValue,
        );

        if (conditionsMet) {
            await initializeHiringRoomChannel(
                hiringroom,
                slackTeamID,
                payload,
                orgID,
                "candidate",
            );
        } else {
            console.log(
                `Event "Offer Created" did not meet conditions for hiring room "${hiringroom.id}".`,
            );
        }
    }
}
