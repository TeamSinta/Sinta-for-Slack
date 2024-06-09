import { AppPageShell } from "@/app/(app)/_components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import homepageicon from "../../../../../public/fistbump.png";
import slackLogo from "../../../../../public/slack-logo.png";
import greenhouseLogo from "../../../../../public/greenhouseLogo.png";

import {
    CheckCircleIcon,
    CogIcon,
    ArrowUpRight,
    Dumbbell,
    Shrub,
} from "lucide-react";
import { StatusIndicator } from "./_components/statusIndicator";
import Image from "next/image";
import Link from "next/link";

const mockData = {
    welcomeText: "Welcome to your Sinta Launchpad!",
    usageStats: [
        {
            title: "Workflows",
            status: "You're in top 10% of accounts!",
            amount: "183 Created",
            alerts: "30.2K Alerts Sent",
        },
        {
            title: "Meeting Intelligence",
            status: "You're in top 30% of accounts!",
            amount: "430 Calls Analyzed",
            alerts: "791 Insights Generated",
        },
        {
            title: "Leaderboard",
            status: "Above-average use",
            amount: "2 Created",
            alerts: "15 Alerts Sent",
        },
        {
            title: "Approvals",
            status: "You're in top 10% of accounts!",
            amount: "7 Created",
            alerts: "2.8K Alerts Sent",
        },
        {
            title: "Reports",
            status: "You're in top 10% of accounts!",
            amount: "35 Created",
            alerts: "2.4K Alerts Sent",
        },
        {
            title: "Board",
            status: "",
            amount: "15 Views Created",
            alerts: "9m Time Spent",
        },
    ],
    potentialFeatures: [
        {
            title: "Debrief Rooms",
            description:
                "Rippling & Mexoworks reduced deals stuck in stage by 70% with Debrief Rooms",
        },
        {
            title: "Goodtime Scheduling",
            description:
                "Qualified & Terminus increased productivity 1.5x with Goodtime",
        },
        // ... add other potential features as per the image
    ],
    systemStatus: [
        {
            service: "API",
            status: "Connected",
        },
        {
            service: "Database",
            status: "Connected",
        },
        {
            service: "CRM",
            status: "Connected",
        },
    ],
};

export default function DashboardPage() {
    return (
        <AppPageShell
            title="Dashboard"
            description="Overview of your account usage and potential features"
        >
            <div className="space-y-6  p-2">
                <Card className="rounded-lg  shadow bg-background">
                <CardHeader className="flex flex-row items-center gap-2 rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-700">
                        <div className="flex items-center">
                            <div className="flex items-center">
                                {" "}
                                {/* Image and text alignment */}
                                <Image
                                    src={homepageicon}
                                    alt="Icon"
                                    className="h-14 w-16"
                                />
                            </div>
                            <div className="ml-3 flex flex-col justify-center">
                                <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                    {mockData.welcomeText} 🦖🔥
                                </CardTitle>
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Start here to elevate your recruitment game,
                                    streamline workflows, and boost team
                                    collaboration.
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <Card className="rounded-lg bg-background">
                <CardHeader className="flex flex-row items-center gap-2 rounded-sm bg-gray-50 px-4 py-3 dark:bg-gray-700">
                <Dumbbell />
                        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            Fantastic work! Here are the features you`ve
                            implemented so far!
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {mockData.usageStats.map((stat) => (
                                <div
                                    key={stat.title}
                                    className="flex items-center justify-between px-2 py-4"
                                >
                                    <div className="flex items-center">
                                        <CheckCircleIcon className="mr-3 h-5 w-5 text-green-500 dark:text-green-400" />
                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                            {stat.title}
                                        </span>
                                        {stat.status && (
                                            <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-500 dark:bg-green-700 dark:text-green-200">
                                                {stat.status}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center">
                                        <div className="flex flex-col text-right">
                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                                {stat.amount}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {" "}
                                                Created
                                            </span>
                                        </div>
                                        <div className="ml-4 flex flex-col text-right">
                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                                {stat.alerts}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {" "}
                                                Alerts Sent
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="mb-4 rounded-lg bg-background">
                    <CardHeader className="flex flex-row items-center gap-2 rounded-sm bg-gray-50 px-4 py-3 dark:bg-gray-700">
                        <Shrub />
                        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            Unleash your team`s potential with these amazing
                            features!
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {mockData.potentialFeatures.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="flex items-center justify-between py-3"
                                >
                                    <div className="flex items-center">
                                        <CheckCircleIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                            {feature.title}
                                        </span>
                                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                            {feature.description}
                                        </span>
                                    </div>
                                    <div className="flex">
                                        <button className="flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition duration-150 ease-in-out hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500">
                                            Create{" "}
                                            <ArrowUpRight className="ml-1" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-lg bg-background">
                <CardHeader className="flex flex-row items-center gap-2 rounded-sm bg-gray-50 px-4 py-3 dark:bg-gray-700">
                <CardTitle className="flex items-center text-lg font-semibold text-gray-800 dark:text-gray-200">
                            <CogIcon className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                            System Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <StatusIndicator
                                    icon={slackLogo}
                                    color="green-500  dark:text-white"
                                    text="Connected"
                                />
                                <StatusIndicator
                                    icon={greenhouseLogo}
                                    color="green-500 dark:text-green-400"
                                    text="Connected"
                                />
                            </div>
                            <Link href={"/integrations"}>
                                <button className="flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition duration-150 ease-in-out hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500">
                                    Manage <ArrowUpRight />
                                </button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppPageShell>
    );
}
