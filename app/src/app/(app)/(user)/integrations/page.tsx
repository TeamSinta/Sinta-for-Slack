import React from "react";
import { AppPageShell } from "../../_components/page-shell";
import { integrationsPageConfig } from "./_constants/page-config";
import {
    checkGreenhouseTeamIdFilled,
    checkSlackTeamIdFilled,
    getOrganizations,
} from "@/server/actions/organization/queries";

import { GreenhouseIntegrationCard } from "./_components/gh-intergration-card";
import { IntegrationCard } from "./_components/intergration-cards";
import { ConflictAlertModal } from "./conflictAlertDialog";
import MixpanelServer from "@/server/mixpanel";
import { getUser } from "@/server/auth";

export default async function Integrations({
    searchParams,
}: {
    searchParams?: { search?: string };
}) {
    const slackIntegration = await checkSlackTeamIdFilled();
    const greenhouseIntegration = await checkGreenhouseTeamIdFilled();
    if (searchParams === undefined) {
        searchParams = {};
    }
    const user = await getUser();
    const { currentOrg } = await getOrganizations();
    const showConflictModal =
        "conflict" in searchParams && searchParams.conflict !== undefined;
    if (showConflictModal) {
        MixpanelServer.track("Modal Shown", {
            distinct_id: user?.id,
            modal_name: "Slack Integration Conflict",
            modal_page: "/integrations",
            modal_shown_at: new Date().toISOString(),
            user_id: user?.id,
            organization_id: currentOrg?.id,
        });
    }
    return (
        <AppPageShell
            title={integrationsPageConfig.title}
            description={integrationsPageConfig.description}
        >
            {showConflictModal && (
                <ConflictAlertModal
                    userId={user?.id}
                    organizationId={currentOrg?.id}
                />
            )}

            <h2 className="text-lg font-medium">Your integrations</h2>
            {(slackIntegration ?? greenhouseIntegration) ? (
                <>
                    {slackIntegration && (
                        <IntegrationCard
                            name="Slack"
                            imageUrl="https://assets-global.website-files.com/621c8d7ad9e04933c4e51ffb/65eba5ffa14998827c92cc01_slack-octothorpe.png"
                            integrationUrl="https://slack.com/oauth/v2/authorize?client_id=4416099431878.6969999702627&scope=channels:manage,channels:read,channels:write.invites,chat:write,chat:write.public,commands,im:write,incoming-webhook,mpim:write,pins:write,team:read,users:read,users:read.email&user_scope=channels:write,chat:write,team:read,users:read,users:read.email"
                            buttonText="Resync"
                            isConnected={slackIntegration ?? ""}
                            lastModified="03 Feb 2024, 11:02 am"
                        />
                    )}
                    {greenhouseIntegration && (
                        <GreenhouseIntegrationCard
                            name="Greenhouse"
                            imageUrl="https://pbs.twimg.com/profile_images/1544425861893558272/V7s98SAp_400x400.jpg"
                            buttonText="Resync"
                            isConnected={!!greenhouseIntegration} // Ensure this is a boolean
                            lastModified="03 Jan 2024, 12:25 pm"
                        />
                    )}
                </>
            ) : (
                <div className="flex min-h-44 w-full items-center justify-center rounded-md border-2 border-dashed border-border p-4">
                    <p className="text-sm text-muted-foreground">
                        No integrations connected yet 😢 Get started by
                        selecting below.
                    </p>
                </div>
            )}

            <h2 className="text-lg font-medium">Explore more integrations</h2>
            {!slackIntegration && (
                <IntegrationCard
                    name="Slack"
                    imageUrl="https://assets-global.website-files.com/621c8d7ad9e04933c4e51ffb/65eba5ffa14998827c92cc01_slack-octothorpe.png"
                    integrationUrl="https://slack.com/oauth/v2/authorize?client_id=4416099431878.6969999702627&scope=channels:manage,channels:read,channels:write.invites,chat:write,chat:write.public,commands,im:write,incoming-webhook,mpim:write,pins:write,team:read,users:read,users:read.email&user_scope=channels:write,chat:write,team:read,users:read,users:read.email"
                    buttonText="Integrate"
                />
            )}
            {!greenhouseIntegration && (
                <GreenhouseIntegrationCard
                    name="Greenhouse"
                    imageUrl="https://pbs.twimg.com/profile_images/1544425861893558272/V7s98SAp_400x400.jpg"
                    buttonText="Integrate"
                />
            )}

            <IntegrationCard
                name="Gmail"
                imageUrl="https://cdn1.iconfinder.com/data/icons/google-new-logos-1/32/gmail_new_logo-512.png"
                integrationUrl="#"
                buttonText="Integrate"
            />
            <IntegrationCard
                name="Calendly"
                imageUrl="https://assets-global.website-files.com/5f15081919fdf673994ab5fd/645ad6ae6528f1b27f65af4f_Calendly-Logo.webp"
                integrationUrl="#"
                buttonText="Integrate"
            />
            <IntegrationCard
                name="Cal.com"
                imageUrl="https://image.spreadshirtmedia.com/image-server/v1/compositions/T812A1PA4267PT17X105Y119D1041706995W13731H2869/views/1,width=650,height=650,appearanceId=1,backgroundColor=ffffff/get-yourself-some-swag-and-support-calcom-to-make-scheduling-more-open-and-accessible.jpg"
                integrationUrl="#"
                buttonText="Integrate"
            />
            <IntegrationCard
                name="Goodtime"
                imageUrl="https://pbs.twimg.com/profile_images/1519699622582792193/VqqcQ-pS_400x400.jpg"
                integrationUrl="#"
                buttonText="Integrate"
            />
        </AppPageShell>
    );
}
