import { AppPageShell } from "../../_components/page-shell";
import { HiringRoomsPageConfig } from "./_constants/page-config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import CreateHiringRoomSheet from "./_components/new-hiring_roomForm";
import {
    getPaginatedHiringRoomsByOrgQuery,
    getPaginatedHiringRoomsExcludingUserQuery,
    getPaginatedHiringRoomsQuery,
} from "@/server/actions/hiring_rooms/queries";
import { WorkflowsTable } from "./_components/workflows-table";
import { type SearchParams } from "@/types/data-table";
import {
    checkGreenhouseTeamIdFilled,
    checkSlackTeamIdFilled,
} from "@/server/actions/organization/queries";
import { AlertIntegrationDialog } from "./alertIntergrationDialog";

type UsersPageProps = {
    searchParams: SearchParams;
};

const searchParamsSchema = z.object({
    page: z.coerce.number().default(1),
    per_page: z.coerce.number().default(10),
    sort: z.string().optional(),
    email: z.string().optional(),
    status: z.enum(["Active", "Inactive", "Archived"]).optional(),
    role: z.string().optional(),
    operator: z.string().optional(),
});

export default async function HiringRooms({ searchParams }: UsersPageProps) {
    const search = searchParamsSchema.parse(searchParams);

    const slackIntegration = await checkSlackTeamIdFilled();
    const greenhouseIntegration = await checkGreenhouseTeamIdFilled();

    const hiring_roomPromise = getPaginatedHiringRoomsQuery(search);
    const hiring_roomAllPromise = getPaginatedHiringRoomsByOrgQuery(search);
    const hiring_roomOrgPromise = getPaginatedHiringRoomsExcludingUserQuery(search);

    return (
        <AppPageShell
            title={HiringRoomsPageConfig.title}
            description={HiringRoomsPageConfig.description}
        >
            <Tabs defaultValue="all" className="w-full space-y-5">
                <div className={"flex justify-between "}>
                    <TabsList className="grid w-[450px] grid-cols-3">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="created_me">
                            Created by me
                        </TabsTrigger>
                        <TabsTrigger value="created_team">
                            Created by team
                        </TabsTrigger>
                    </TabsList>
                    {slackIntegration && greenhouseIntegration ? (
                        <CreateHiringRoomSheet />
                    ) : (
                        <AlertIntegrationDialog />
                    )}
                </div>
                <TabsContent value="all">
                    <div className="w-full space-y-5">
                        <WorkflowsTable workflowsPromise={hiring_roomAllPromise} />
                    </div>
                </TabsContent>
                <TabsContent value="created_team">
                    <WorkflowsTable workflowsPromise={hiring_roomOrgPromise} />
                </TabsContent>
                <TabsContent value="created_me">
                    <WorkflowsTable workflowsPromise={hiring_roomPromise} />
                </TabsContent>
            </Tabs>
        </AppPageShell>
    );
}
