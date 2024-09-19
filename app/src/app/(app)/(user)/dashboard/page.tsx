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
    Wrench,
    SparkleIcon,
    SparklesIcon,
    PlaneIcon,
    Send,
    HashIcon,
    User,
    Pencil,
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
import LogInTracker from "./_components/logInTracker";
import GlobalClickTracker from "./_components/globalClickTracker";
import { Icon } from "@radix-ui/react-select";

const mockData = {
    welcomeText: "Welcome to your Sinta Launchpad",
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
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-sm text-gray-800 dark:bg-gray-600 dark:text-gray-200">
                        1
                    </div>{" "}
                    <CardTitle className="text-sm font-medium">
                        Connect Slack and Greenhouse to Sinta
                    </CardTitle>
                </div>
                <div className="flex items-center">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {!slackIntegration && (
                        <div className="flex items-center justify-between">
                            <StatusIndicator
                                icon={slackLogo}
                                color="red-500 dark:text-red-400"
                                text="Connect Slack"
                            />
                            <Link href="/integrations">
                                <button className="flex items-center rounded-lg border px-4 py-2 text-sm text-gray-700 transition hover:border-gray-400 dark:border-gray-600 dark:text-gray-300">
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
                                <button className="flex items-center rounded-lg border px-4 py-2 text-sm text-gray-700 transition hover:border-gray-400 dark:border-gray-600 dark:text-gray-300">
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
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-4">
                    <div className=" flex h-6 w-6 items-center  justify-center rounded-full bg-gray-200 text-sm text-gray-800 dark:bg-gray-600 dark:text-gray-200">
                        2
                    </div>

                    <CardTitle className="text-sm font-medium">
                        Create a new workflow
                    </CardTitle>
                </div>
                <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Create a new workflow to start getting updates in
                            Slack
                        </span>
                    </div>

                    <Link href="/workflows">
                        <button className="flex items-center rounded-lg border px-4 py-2 text-sm text-gray-700 transition hover:border-gray-400 dark:border-gray-600 dark:text-gray-300">
                            Create <ArrowUpRight className="ml-1" />
                        </button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );

    const renderActiveWorkflowsCard = () => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Active Workflows
                </CardTitle>
                <Zap className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
            </CardHeader>
            <CardContent>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {workflows.map((workflow) => (
                        <div
                            key={workflow.name}
                            className="flex items-center justify-between py-3"
                        >
                            <div className="flex items-center space-x-4">
                                <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400" />
                                <span className="text-sm text-gray-700 dark:text-white">
                                    {workflow.name}
                                </span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="ml-2 flex items-center rounded bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-500">
                                    <User className="mr-2 h-4 w-4" /> 2
                                </span>
                                <span className="ml-2 flex items-center rounded bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-500">
                                    <Send className="mr-2 h-4 w-4" /> 2
                                </span>
                                <Link href="/workflows">
                                    <button className="flex items-center rounded-md border px-3 py-2 text-sm text-gray-700 transition hover:border-gray-400 dark:border-gray-600 dark:text-gray-300">
                                        Edit{" "}
                                        <ArrowUpRight className=" ml-2 h-4 w-4" />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-2 text-start">
                    <Link href="/workflows">
                        <Button variant={"ghost"}>
                            View All <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );

    const renderConnectionStatusCard = () => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Connection Status
                </CardTitle>
                <Cable className="h-4 w-4" />
            </CardHeader>
            <CardContent>
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
                        <button className="flex items-center rounded-lg border px-4 py-2 text-sm text-gray-700 transition hover:border-gray-400 dark:border-gray-600 dark:text-gray-300">
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
            <LogInTracker />
            <GlobalClickTracker />
            <div className="space-y-6 ">
                <Card className="rounded-lg bg-background p-0 shadow ">
                    <CardHeader className="=flex flex-row items-center justify-between gap-2 rounded-xl p-5  ">
                        <div className="flex items-center">
                            {/* <Image
                                src={homepageicon}
                                alt="Icon"
                                className="h-14 w-16"
                            /> */}
                            <div className="flex flex-col justify-center space-y-1">
                                <CardTitle className="text-sm font-medium">
                                    {mockData.welcomeText}
                                </CardTitle>
                                <span className="text-xs text-gray-500 dark:text-gray-300">
                                    Start here to elevate your recruitment game,
                                    streamline workflows, and boost team
                                    collaboration.
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <SparklesIcon className="mb-3 h-4 w-4  text-muted-foreground dark:text-white" />
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
