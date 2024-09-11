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
import { StageSelectionModal } from "./new/components/create-new-modal";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteUrls } from "@/config/urls";

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
    const hiringroomOrgPromise =
        getPaginatedHiringroomsExcludingUserQuery(search);

        return (
          <AppPageShell
              title={HiringroomsPageConfig.title}
              description={HiringroomsPageConfig.description}
          >
              <div className="relative min-h-screen bg-white dark:bg-black">
                  {/* Smaller Gradient Background */}
                  {/* <div className="absolute inset-0 h-full w-full bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.3)_0%,_rgba(99,102,241,0.1)_20%,_transparent_40%)]"></div> */}

                  {/* Gradient Dotted Background with Transparent Edges */}
                  <div className="absolute h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

                  <div className="relative z-10">
                      <Tabs defaultValue="all" className="w-full space-y-5">
                          <div className="flex justify-between">
                              <TabsList className="grid w-[450px] grid-cols-3  " >
                                  <TabsTrigger value="all" className="dark:text-gray-100  dark:border-gray-700">All</TabsTrigger>
                                  <TabsTrigger value="created_me" className="dark:text-gray-100 dark:border-gray-700">
                                      Created by me
                                  </TabsTrigger>
                                  <TabsTrigger value="created_team" className="dark:text-gray-100  dark:border-gray-700">
                                      Created by team
                                  </TabsTrigger>
                              </TabsList>
                              {slackIntegration && greenhouseIntegration ? (
                                  <>
                                      {/* <CreateHiringroomSheet /> */}
                                      {/* <StageSelectionModal/> */}
                                      <Link href={siteUrls.hiringrooms.form}>
                                          <Button
                                              variant="outline"
                                              className="rounded-sm bg-indigo-500 dark:bg-indigo-600 px-4 py-2 text-white shadow hover:bg-indigo-600 dark:hover:bg-indigo-700 hover:text-white"
                                          >
                                              New Hire Room
                                          </Button>
                                      </Link>
                                  </>
                              ) : (
                                  <AlertIntegrationDialog />
                              )}
                          </div>
                          <TabsContent value="all">
                              <div className="w-full space-y-5">
                                  <HiringroomsTable
                                      hiringroomsPromise={hiringroomAllPromise}
                                  />
                              </div>
                          </TabsContent>
                          <TabsContent value="created_team">
                              <HiringroomsTable
                                  hiringroomsPromise={hiringroomOrgPromise}
                              />
                          </TabsContent>
                          <TabsContent value="created_me">
                              <HiringroomsTable
                                  hiringroomsPromise={hiringroomPromise}
                              />
                          </TabsContent>
                      </Tabs>
                  </div>
              </div>
          </AppPageShell>
      );

}
