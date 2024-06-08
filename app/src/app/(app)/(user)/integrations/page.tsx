import React from "react";
import { AppPageShell } from "../../_components/page-shell";
import { integrationsPageConfig } from "./_constants/page-config";
import {
    checkGreenhouseTeamIdFilled,
    checkSlackTeamIdFilled,
} from "@/server/actions/organization/queries";

import { GreenhouseIntegrationCard } from "./_components/gh-intergration-card";
import { IntegrationCard } from "./_components/intergration-cards";

export default async function Integrations() {
    const slackIntegration = await checkSlackTeamIdFilled();
    const greenhouseIntegration = await checkGreenhouseTeamIdFilled();

    return (
        <AppPageShell
            title={integrationsPageConfig.title}
            description={integrationsPageConfig.description}
        >
            <h2 className="text-lg font-medium">Your integrations</h2>
            {slackIntegration ?? greenhouseIntegration ? (
                <>
                    {slackIntegration && (
                        <IntegrationCard
                            name="Slack"
                            imageUrl="https://assets-global.website-files.com/621c8d7ad9e04933c4e51ffb/65eba5ffa14998827c92cc01_slack-octothorpe.png"
                            integrationUrl="https://slack.com/oauth/v2/authorize?client_id=4416099431878.6969999702627&scope=channels:manage,channels:read,channels:write.invites,chat:write,commands,groups:read,im:read,im:write,incoming-webhook,mpim:read,team:read,users:read,users:read.email&user_scope=channels:write,team:read,users:read,users:read.email"
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
                    integrationUrl="https://slack.com/oauth/v2/authorize?client_id=4416099431878.6969999702627&scope=commands,incoming-webhook,channels:manage,chat:write,channels:write.invites,im:write&user_scope=channels:write"
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
