"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import va from "@vercel/analytics";
import SlackButton from "../../../_components/slack-button";
import { AppPageShell } from "../../../_components/page-shell";

export default function SuccessTeam() {
    const searchParams = useSearchParams(); // Assuming 'teamId' is a part of the route
    const search = searchParams.get("teamId");

    useEffect(() => {
        if (search) {
            va.track("Install Success", { search });
            // Additional client-side data fetching can occur here if needed
        }
    }, [search]);

    return (
        <AppPageShell title={"Success"} description={""}>
            <div className="flex flex-col items-center">
                <div className="max-w-sm  text-center sm:max-w-lg">
                    <div className="flex">
                        <h1 className="my-8 bg-gradient-to-br from-indigo-500 via-indigo-600 to-[#6462f1] bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent dark:from-gray-700 dark:via-indigo-700 dark:to-[#6462f1] md:text-7xl">
                            {" "}
                            Installation Successful
                        </h1>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 sm:text-lg">
                        You can now create a channel to receive notifications in
                        and start configuring the bot with the{" "}
                        <span className="font-mono text-red-500 dark:text-red-400">
                            /configure
                        </span>{" "}
                        command.
                    </p>
                </div>

                <div className="relative my-3">
                    {/* Video and playback controls */}
                </div>
                <div className="flex flex-col space-y-2 text-center">
                    <SlackButton
                        text="Open Slack"
                        url={
                            search
                                ? `slack://slack.com/app_redirect?app=${search}`
                                : "https://slack.com"
                        }
                    />
                </div>
            </div>
        </AppPageShell>
    );
}
