import HiringroomFormPage from "./_components/hiring-rooms-form";

export default function FormPageRooms({
    params,
}: {
    params: { workflowId?: string };
}) {

    return (
        <>
                <HiringroomFormPage/>
        </>
    );
}

export const dynamic = 'force-dynamic'
