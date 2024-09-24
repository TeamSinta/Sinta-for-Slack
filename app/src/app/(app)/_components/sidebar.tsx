'use client'; // Mark as a client-side component

import { useEffect, useState } from "react";
import { Icons } from "@/components/ui/icons";
import { siteUrls } from "@/config/urls";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { UserDropdown } from "@/app/(app)/_components/user-dropdown";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { SidebarNav } from "@/app/(app)/_components/sidebar-nav";
import { OrgSelectDropdown, type UserOrgs } from "@/app/(app)/_components/org-select-dropdown";
import { Skeleton } from "@/components/ui/skeleton";

type SideNavProps = {
    sidebarNavIncludeIds?: string[];
    sidebarNavRemoveIds?: string[];
    showOrgSwitcher?: boolean;
};

/**
 * Client-side Sidebar component
 */
export function Sidebar({
    sidebarNavIncludeIds,
    sidebarNavRemoveIds,
    showOrgSwitcher = true,
}: SideNavProps) {
    const [user, setUser] = useState(null);
    const [currentOrg, setCurrentOrg] = useState(null);
    const [userOrgs, setUserOrgs] = useState<UserOrgs[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch sidebar data from API route
        const fetchData = async () => {
            try {
                const response = await fetch("/api/sidebar-data");
                const { user, currentOrg, userOrgs } = await response.json();
                setUser(user);
                setCurrentOrg(currentOrg);
                setUserOrgs(userOrgs);
            } catch (error) {
                console.error("Failed to fetch sidebar data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    console.log(sidebarNavIncludeIds)

    const myOrgs = userOrgs.filter((org) => org.ownerId === user?.id);
    const sharedOrgs = userOrgs.filter((org) => org.ownerId !== user?.id);

    const urgOrgsData: UserOrgs[] = [
        {
            heading: "My Orgs",
            items: myOrgs,
        },
        {
            heading: "Shared Orgs",
            items: sharedOrgs,
        },
    ];

    if (isLoading) {
        return <SidebarLoading showOrgSwitcher={showOrgSwitcher} />;
    }

    return (
        <aside className={cn("h-full w-full")}>
            <div className={cn("flex h-16 items-center justify-between")}>
                <Link
                    href={siteUrls.dashboard.home}
                    className={cn("z-10 transition-transform hover:scale-90")}
                >
                    <Icons.logo
                        className="text-xl"
                        iconProps={{ className: "w-6 h-6 fill-primary" }}
                    />
                </Link>
            </div>

            <div className="py-2">
                <UserDropdown user={user} />
            </div>

            {showOrgSwitcher && (
                <div className="py-2">
                    <OrgSelectDropdown userOrgs={urgOrgsData} currentOrg={currentOrg} />
                </div>
            )}

            <ScrollArea style={{ height: "calc(100vh - 10.5rem)" }}>
                <div className="h-full w-full py-2">
                    <SidebarNav
                        sidebarNavIncludeIds={sidebarNavIncludeIds}
                        sidebarNavRemoveIds={sidebarNavRemoveIds}
                        user={user}
                    />
                    <ScrollBar orientation="vertical" />
                </div>
            </ScrollArea>
        </aside>
    );
}

/**
 * Sidebar loading skeleton
 */
export function SidebarLoading({ showOrgSwitcher = true }: { showOrgSwitcher?: boolean }) {
    return (
        <aside className={cn("h-full w-full")}>
            <div className={cn(" flex h-16 items-center justify-between")}>
                <Link
                    href={siteUrls.home}
                    className={cn("z-10 transition-transform hover:scale-90")}
                >
                    <Icons.logo
                        className="text-xl"
                        iconProps={{ className: "w-6 h-6 fill-primary" }}
                    />
                </Link>
            </div>

            <div className="py-2">
                <Skeleton className="h-9 w-full rounded-md" />
            </div>

            {showOrgSwitcher && (
                <div className="py-2">
                    <Skeleton className="h-9 w-full rounded-md" />
                </div>
            )}

            <ScrollArea style={{ height: "calc(100vh - 10.5rem)" }}>
                <div className="h-full w-full space-y-2 py-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-8 w-full rounded-md" />
                    ))}
                    <ScrollBar orientation="vertical" />
                </div>
            </ScrollArea>
        </aside>
    );
}
