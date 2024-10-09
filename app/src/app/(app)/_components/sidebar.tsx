"use client"; // This explicitly marks the component as a client-side component

import { useEffect, useState } from "react";
import { Icons } from "@/components/ui/icons";
import { siteUrls } from "@/config/urls";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { UserDropdown } from "@/app/(app)/_components/user-dropdown";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { SidebarNav } from "@/app/(app)/_components/sidebar-nav";
import { OrgSelectDropdown } from "@/app/(app)/_components/org-select-dropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthOrgs, getAuthUser } from "@/server/actions/user/queries";
import { User } from "next-auth";
import { organizations } from "@/server/db/schema";

type SideNavProps = {
    sidebarNavIncludeIds?: string[];
    sidebarNavRemoveIds?: string[];
    showOrgSwitcher?: boolean;
};

// This is the correct type for organization objects
export type Org = typeof organizations.$inferSelect;

export type UserOrgs = {
    heading: string;
    items: Org[];
};



/*
 * Client-side Sidebar component
 */
export function Sidebar({
    sidebarNavIncludeIds,
    sidebarNavRemoveIds,
    showOrgSwitcher = true,
}: SideNavProps) {
    const [user, setUser] = useState<User | null>(null);
    const [currentOrg, setCurrentOrg] = useState<Org | null>(null); // Use Org type instead of OrgSelectDropdownProps
    const [userOrgs, setUserOrgs] = useState<UserOrgs[]>([]); // Correct type for userOrgs
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const fetchSidebarData = async () => {
          try {
              const user = await getAuthUser();
              const { currentOrg, userOrgs } = await getAuthOrgs();

              setUser(user);
              setCurrentOrg(currentOrg);

              const mappedUserOrgs: UserOrgs[] = [
                  {
                      heading: "My Orgs",
                      items: userOrgs.filter((org) => org.ownerId === user?.id),
                  },
                  {
                      heading: "Shared Orgs",
                      items: userOrgs.filter((org) => org.ownerId !== user?.id),
                  }
              ];

              setUserOrgs(mappedUserOrgs);
          } catch (error) {
              console.error("Failed to fetch sidebar data", error);
          } finally {
              setIsLoading(false);
          }
      };

      fetchSidebarData();
  }, []);

    const myOrgs = userOrgs.find((orgGroup) => orgGroup.heading === "My Orgs")?.items || [];
    const sharedOrgs = userOrgs.find((orgGroup) => orgGroup.heading === "Shared Orgs")?.items || [];

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
            <div className={cn(" flex h-16 items-center justify-between")}>
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

                  {showOrgSwitcher && currentOrg && (
          <div className="py-2">
              <OrgSelectDropdown
                  userOrgs={urgOrgsData}
                  currentOrg={currentOrg} // Only pass if not null
              />
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
export function SidebarLoading({
    showOrgSwitcher = true,
}: {
    showOrgSwitcher?: boolean;
}) {
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
