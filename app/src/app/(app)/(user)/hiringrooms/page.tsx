import { AppPageShell } from "../../_components/page-shell";
import { HiringroomsPageConfig } from "./_constants/page-config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import CreateHiringroomSheet from "./_components/new-hiringroomForm";
import {
    getPaginatedHiringroomsByOrgQuery,
    getPaginatedHiringroomsExcludingUserQuery,
    getPaginatedHiringroomsQuery,
} from "@/server/actions/hiringrooms/queries";
import { HiringroomsTable } from "./_components/hiringrooms-table";
import { type SearchParams } from "@/types/data-table";
import {
    checkGreenhouseTeamIdFilled,
    checkSlackTeamIdFilled,
} from "@/server/actions/organization/queries";
import { AlertIntegrationDialog } from "./alertIntergrationDialog";
// Assuming HiringroomStatus is the enum type for status

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

export default async function Hiringrooms({ searchParams }: UsersPageProps) {
    const search = searchParamsSchema.parse(searchParams);

    const slackIntegration = await checkSlackTeamIdFilled();
    const greenhouseIntegration = await checkGreenhouseTeamIdFilled();

    const hiringroomPromise = getPaginatedHiringroomsQuery(search);
    const hiringroomAllPromise = getPaginatedHiringroomsByOrgQuery(search);
    const hiringroomOrgPromise = getPaginatedHiringroomsExcludingUserQuery(search);

    return (
        <AppPageShell
            title={HiringroomsPageConfig.title}
            description={HiringroomsPageConfig.description}
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
                        <CreateHiringroomSheet />
                    ) : (
                        <AlertIntegrationDialog />
                    )}
                </div>
                <TabsContent value="all">
                    <div className="w-full space-y-5">
                        <HiringroomsTable hiringroomsPromise={hiringroomAllPromise} />
                    </div>
                </TabsContent>
                <TabsContent value="created_team">
                    <HiringroomsTable hiringroomsPromise={hiringroomOrgPromise} />
                </TabsContent>
                <TabsContent value="created_me">
                    <HiringroomsTable hiringroomsPromise={hiringroomPromise} />
                </TabsContent>
            </Tabs>
        </AppPageShell>
    );
}
