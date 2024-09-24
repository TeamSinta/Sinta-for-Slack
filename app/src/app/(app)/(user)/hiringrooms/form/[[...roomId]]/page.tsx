import CreatHiringRoom from "../_components/createHiringRoom";
import EditHireRoom from "../_components/EditHireRoom";


export default function FormPageRooms({
    params,
}: {
    params: { roomId?: string };
}) {
    // Determine if "new" is in the params, or it's a roomId for editing
    const roomId = params.roomId || null;
    console.log(params, "params");
    console.log(roomId, "roomId");
    console.log('her')

    return (
        <>
            {/* Check if roomId is "new" and render CreateHiringRoom */}
            {roomId?.includes('new') ? (
                <CreatHiringRoom />
            ) : roomId ? (
                // If roomId exists and it's not "new", render the edit form
                <EditHireRoom roomId={roomId} />
            ) : (
                // If there's no roomId, handle default case (could be a 404 or redirection)
                <div>No room ID provided or invalid route</div>
            )}
        </>
    );
}

export const dynamic = "force-dynamic";
