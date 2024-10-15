import { fetchHireRoomsByObjectFieldAndAlertType } from "@/server/actions/hiringrooms/queries";

export async function handleOfferCreatedHiringRooms(data: any, orgID: string) {
    const payload = data.payload;

    const hiringRooms = await fetchHireRoomsByObjectFieldAndAlertType(
        orgID,
        "Jobs",
        "Job Created",
    );

    if (!hiringRooms.length) {
        console.log("No hiring rooms found for this event.");
        return;
    }
}
