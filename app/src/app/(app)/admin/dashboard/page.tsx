import { AppPageShell } from "@/app/(app)/_components/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { siteUrls } from "@/config/urls";
import { cn } from "@/lib/utils";

import {
    DollarSignIcon,
    UserRoundCheckIcon,
    UserRoundPlusIcon,
    Users2Icon,
} from "lucide-react";
import Link from "next/link";
import { adminDashConfig } from "../_constants/page-config";
import { StatsCard } from "../_components/stats-card";
import { UsersChart } from "../_components/users-chart";
import { SubsChart } from "../_components/subs-chart";
import { RevenueChart } from "../_components/revenue-chart";
import { getUsersCount } from "@/server/actions/user/queries";

export default async function AdminDashPage() {
    const usersCountData = await getUsersCount();
    const usersChartData = usersCountData.usersCountByMonth;

    return (
        <AppPageShell
            title={adminDashConfig.title}
            description={adminDashConfig.description}
        >
            <div className="grid w-full gap-8">
                <p className="text-sm">
                    This a simple dashboard with Analytics, to see detailed
                    Analytics go to{" "}
                    <Link
                        href={siteUrls.admin.analytics}
                        className={cn(
                            buttonVariants({
                                variant: "link",
                                size: "default",
                                className: "px-0 underline",
                            }),
                        )}
                    >
                        Mixpanel Dashboard
                    </Link>
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Users"
                        value={String(usersCountData.totalCount)}
                        Icon={Users2Icon}
                        subText="Total users joined"
                    />

                    <StatsCard
                        title="Revenue"
                        value={"$0"}
                        Icon={DollarSignIcon}
                        subText="Total revenue generated"
                    />

                    <StatsCard
                        title="Subscriptions"
                        value={"0"}
                        Icon={UserRoundPlusIcon}
                        subText="Total subscriptions made"
                    />

                    <StatsCard
                        title="Active Subscriptions"
                        value={"0"}
                        Icon={UserRoundCheckIcon}
                        subText="Current active subscriptions"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <UsersChart data={usersChartData} />

                    {/* <SubsChart data={} />

                    <RevenueChart data={revenueChartData} /> */}
                </div>
            </div>
        </AppPageShell>
    );
}
