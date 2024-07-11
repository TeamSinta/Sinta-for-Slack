import { AppPageShell } from "@/app/(app)/_components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import homepageicon from "../../../../../public/fistbump.png";
import slackLogo from "../../../../../public/slack-logo.png";
import greenhouseLogo from "../../../../../public/greenhouseLogo.png";
import {
    CheckCircleIcon,
    ArrowUpRight,
    Zap,
    Cable,
} from "lucide-react";
import { StatusIndicator } from "./_components/statusIndicator";
import Image from "next/image";
import Link from "next/link";
import {
    checkGreenhouseTeamIdFilled,
    checkSlackTeamIdFilled,
    Checktoseeworkflows,
    getFirstFiveWorkflows,
} from "@/server/actions/organization/queries";
import { Button } from "@/components/ui/button";

const mockData = {
    welcomeText: "Welcome to your Sinta Launchpad!",
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
    onboardingSteps: [
        "Complete your profile",
        "Connect Slack integration",
        "Connect Greenhouse integration",
        "Explore potential features",
    ],
};

export default async function DashboardPage() {
    const slackIntegration = await checkSlackTeamIdFilled();
    const greenhouseIntegration = await checkGreenhouseTeamIdFilled();
    const workflowsExist = await Checktoseeworkflows();
    const workflows = workflowsExist ? await getFirstFiveWorkflows() : [];

    const renderConnectCard = () => (
        <Card className="rounded-lg bg-background">
            <CardHeader className="flex flex-row items-center gap-2 rounded-sm bg-gray-50 px-4 py-3 dark:bg-gray-700">
                <div className="flex items-center">
                    <div className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200">
                        1
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Connect Slack and Greenhouse to Sinta
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <div className="space-y-4">
                    {!slackIntegration && (
                        <div className="flex items-center justify-between">
                            <StatusIndicator
                                icon={slackLogo}
                                color="red-500 dark:text-red-400"
                                text="Connect Slack"
                            />
                            <Link href="/integrations">
                                <button className="flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition duration-150 ease-in-out hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500">
                                    Connect <ArrowUpRight />
                                </button>
                            </Link>
                        </div>
                    )}
                    {!slackIntegration && !greenhouseIntegration && (
                        <div className="my-4 border-t border-gray-200 dark:border-gray-700"></div>
                    )}
                    {!greenhouseIntegration && (
                        <div className="flex items-center justify-between">
                            <StatusIndicator
                                icon={greenhouseLogo}
                                color="red-500 dark:text-red-400"
                                text="Connect Greenhouse"
                            />
                            <Link href="/integrations">
                                <button className="flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition duration-150 ease-in-out hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500">
                                    Connect <ArrowUpRight />
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    const renderCreateWorkflowCard = () => (
        <Card className="mb-4 rounded-lg bg-background">
            <CardHeader className="flex flex-row items-center gap-2 rounded-sm bg-gray-50 px-4 py-3 dark:bg-gray-700">
                <div className="flex items-center">
                    {slackIntegration && greenhouseIntegration ? (
                        <Zap className="mr-2 h-5 w-5" />
                    ) : (
                        <div className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200">
                            2
                        </div>
                    )}
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Create a new workflow
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <div className="flex items-center justify-between py-3">
                    <div className="flex items-center">
                        <CheckCircleIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                            Create a new workflow to start getting updates in
                            Slack
                        </span>
                    </div>
                    <Link href="/workflows">
                        <button className="flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition duration-150 ease-in-out hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500">
                            Create <ArrowUpRight className="ml-1" />
                        </button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );

    const renderActiveWorkflowsCard = () => (
        <Card className="mb-4 rounded-lg bg-background">
            <CardHeader className="flex flex-row items-center gap-2 rounded-sm bg-gray-50 px-4 py-3 dark:bg-gray-700">
                <Zap className="mt-1.5 h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Active Workflows
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {workflows.map((workflow) => (
                        <div
                            key={workflow.name}
                            className="flex items-center justify-between py-3"
                        >
                            <div className="flex items-center">
                                <CheckCircleIcon className="mr-3 h-5 w-5 text-green-500 dark:text-green-400" />
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {workflow.name}
                                </span>
                            </div>
                            <Link href="/workflows">
                                <button className="flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition duration-150 ease-in-out hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500">
                                    Edit <ArrowUpRight className="ml-1" />
                                </button>
                            </Link>
                        </div>
                    ))}
                </div>
                <div className="mt-2 text-start">
                    <Link href="/workflows">
                        <Button variant={"ghost"} className=" ">
                            View All
                            <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );

    const renderConnectionStatusCard = () => (
        <Card className="rounded-lg bg-background">
            <CardHeader className="flex flex-row items-center gap-2 rounded-sm bg-gray-50 px-4 py-3 dark:bg-gray-700">
                <CardTitle className="flex items-center text-lg font-semibold text-gray-800 dark:text-gray-200">
                    <Cable className="mr-2 h-5 w-5 " />
                    Connection Status
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {slackIntegration && (
                            <StatusIndicator
                                icon={slackLogo}
                                color="green-500 dark:text-green-400"
                                text="Connected"
                            />
                        )}
                        {greenhouseIntegration && (
                            <StatusIndicator
                                icon={greenhouseLogo}
                                color="green-500 dark:text-green-400"
                                text="Connected"
                            />
                        )}
                    </div>
                    <Link href="/integrations">
                        <button className="flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition duration-150 ease-in-out hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500">
                            Manage <ArrowUpRight />
                        </button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <AppPageShell
            title="Dashboard"
            description="Overview of your account usage and potential features"
        >
            <div className="space-y-6 p-2">
                <Card className="rounded-lg bg-background shadow">
                    <CardHeader className="flex flex-row items-center gap-2 rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-700">
                        <div className="flex items-center">
                            <Image
                                src={homepageicon}
                                alt="Icon"
                                className="h-14 w-16"
                            />
                            <div className="ml-3 flex flex-col justify-center">
                                <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                    {mockData.welcomeText} 🚀
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

                {slackIntegration && greenhouseIntegration ? (
                    workflowsExist ? (
                        renderActiveWorkflowsCard()
                    ) : (
                        renderCreateWorkflowCard()
                    )
                ) : (
                    <>
                        {renderConnectCard()}
                        {renderCreateWorkflowCard()}
                    </>
                )}

                {(slackIntegration ?? greenhouseIntegration) &&
                    renderConnectionStatusCard()}
            </div>
        </AppPageShell>
    );
}
