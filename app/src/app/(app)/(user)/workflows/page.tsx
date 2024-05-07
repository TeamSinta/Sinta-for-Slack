import { AppPageShell } from "../../_components/page-shell";
import { WorkflowsPageConfig } from "./_constants/page-config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { SearchParams } from "@/types/data-table";
import { WorkflowsTable } from "./_componenets/workflows-table";
import { z } from "zod";
import CreateWorkflowSheet from "./_componenets/new-workflowForm";
import { getPaginatedWorkflowsQuery } from "@/server/actions/workflows/queries";

type UsersPageProps = {
    searchParams: SearchParams;
};

const searchParamsSchema = z.object({
    page: z.coerce.number().default(1),
    per_page: z.coerce.number().default(10),
    sort: z.string().optional(),
    email: z.string().optional(),
    status: z.enum(["Active", "Inactive", "Archived"]).optional(), // Ensure only valid statuses can be used
    role: z.string().optional(),
    operator: z.string().optional(),
});

export default function Workflows({ searchParams }: UsersPageProps) {
    const search = searchParamsSchema.parse(searchParams);

    const workflowPromise = getPaginatedWorkflowsQuery(search);

    return (
        <>
            <AppPageShell
                title={WorkflowsPageConfig.title}
                description={WorkflowsPageConfig.description}
            >
                <Tabs defaultValue="all" className="w-full space-y-5">
                    <div className={"flex justify-between "}>
                        <TabsList className="grid w-[450px] grid-cols-3">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="created_team">
                                Created by me
                            </TabsTrigger>
                            <TabsTrigger value="created_me">
                                Created by team
                            </TabsTrigger>
                        </TabsList>
                        <CreateWorkflowSheet />
                    </div>
                    <TabsContent value="all">
                        <div className="w-full space-y-5">
                            <WorkflowsTable
                                workflowsPromise={workflowPromise}
                            />
                        </div>
                    </TabsContent>
                    <TabsContent value="created_team">
                        Change your password here.
                    </TabsContent>
                    <TabsContent value="created_me">
                        Change your password here.
                    </TabsContent>
                </Tabs>
            </AppPageShell>
        </>
    );
}
