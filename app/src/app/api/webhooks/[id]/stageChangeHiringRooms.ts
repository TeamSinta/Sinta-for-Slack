import { fetchHireRoomsByObjectFieldAndAlertType } from "@/server/actions/hiringrooms/queries";
import { getSlackTeamIDByHiringroomID } from "@/server/actions/slack/query";
import {
    getAttributeValue,
    initializeHiringRoomChannel,
} from "@/utils/hiring-rooms/event-processing";
import { checkConditions } from "@/utils/workflows";

export async function handleStageChangeHiringRooms(data: any, orgID: string) {
    const application = data.payload.application;

    const hiringRooms = await fetchHireRoomsByObjectFieldAndAlertType(
        orgID,
        "Candidates",
        "Candidate Stage Change",
    );

    if (!hiringRooms.length) {
        console.log("No hiring rooms found for this event.");
        return;
    }

    for (const hiringroom of hiringRooms) {
        const slackTeamID = await getSlackTeamIDByHiringroomID(hiringroom.id);

        const conditionsMet = checkConditions(
            application,
            hiringroom.conditions as any[],
            getAttributeValue,
        );

        if (conditionsMet) {
            await initializeHiringRoomChannel(
                hiringroom,
                slackTeamID,
                application,
                orgID,
                "candidate",
            );
        } else {
            console.log(
                `Event "Stage Change" did not meet conditions for hiring room "${hiringroom.id}".`,
            );
        }
    }
}
