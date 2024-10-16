import { fetchHireRoomsByObjectFieldAndAlertType } from "@/server/actions/hiringrooms/queries";
import { getSlackTeamIDByHiringroomID } from "@/server/actions/slack/query";
import {
    getAttributeValue,
    initializeHiringRoomChannel,
} from "@/utils/hiring-rooms/event-processing";
import { checkConditions } from "@/utils/workflows";

export async function handleOfferCreatedHiringRooms(data: any, orgID: string) {
    const payload = data.payload;

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
