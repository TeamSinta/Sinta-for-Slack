import { AppPageShell } from "../../_components/page-shell";
import { WorkflowsPageConfig } from "./_constants/page-config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import {
    getPaginatedWorkflowsByOrgQuery,
    getPaginatedWorkflowsExcludingUserQuery,
    getPaginatedWorkflowsQuery,
} from "@/server/actions/workflows/queries";
import { WorkflowsTable } from "./_components/workflows-table";
import {
    checkGreenhouseTeamIdFilled,
    checkSlackTeamIdFilled,
} from "@/server/actions/organization/queries";
import { AlertIntegrationDialog } from "./alertIntergrationDialog";
import WorkflowSheet from "./_components/new-workflowForm";
import { WorkflowDialog } from "./_components/workflow-dialog";
import { type SearchParams } from "@/types/data-table";

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
    edit: z.string().optional(),
    workflowId: z.string().optional(),
});

export default async function Workflows({ searchParams }: UsersPageProps) {
    const search = searchParamsSchema.parse(searchParams);

    const slackIntegration = await checkSlackTeamIdFilled();
    const greenhouseIntegration = await checkGreenhouseTeamIdFilled();

    const workflowPromise = getPaginatedWorkflowsQuery(search);
    const workflowAllPromise = getPaginatedWorkflowsByOrgQuery(search);
    const workflowOrgPromise = getPaginatedWorkflowsExcludingUserQuery(search);
    const isEdit = searchParams.edit;
    const workflowId = searchParams.workflowId as any;

    return (
        <AppPageShell
            title={WorkflowsPageConfig.title}
            description={WorkflowsPageConfig.description}
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
                    {isEdit === "true" && workflowId ? (
                        <WorkflowSheet workflowId={workflowId} mode={"edit"} />
                    ) : (
                        <></>
                    )}
                    {!isEdit && slackIntegration && greenhouseIntegration ? (
                        <WorkflowDialog />
                    ) : (
                        <AlertIntegrationDialog />
                    )}
                </div>
                <TabsContent value="all">
                    <div className="w-full space-y-5">
                        <WorkflowsTable workflowsPromise={workflowAllPromise} />
                    </div>
                </TabsContent>
                <TabsContent value="created_team">
                    <WorkflowsTable workflowsPromise={workflowOrgPromise} />
                </TabsContent>
                <TabsContent value="created_me">
                    <WorkflowsTable workflowsPromise={workflowPromise} />
                </TabsContent>
            </Tabs>
        </AppPageShell>
    );
}
