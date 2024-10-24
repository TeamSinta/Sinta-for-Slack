import React from "react";
import { AppLayoutShell } from "@/app/(app)/_components/layout-shell";
import { sidebarConfig } from "@/config/sidebar";
import { getAuthOrgs, getAuthUser } from "@/server/actions/user/queries";

type AppLayoutProps = {
    children: React.ReactNode;
};

export default async function AdminLayout({ children }: AppLayoutProps) {
    // these are the ids of the sidebar nav items to include in the sidebar specifically @get ids from the sidebar config
    const sideNavIncludedIds: string[] = [sidebarConfig.navIds.admin];
    const user = await getAuthUser();
    const orgs = await getAuthOrgs();

    const reassignedUser = user
        ? {
              id: user.id,
              role: user.role,
              createdAt: user.createdAt,
              emailVerified: user.emailVerified ?? null,
              isNewUser: user.isNewUser,
              name: user.name ?? null,
              email: user.email ?? "",
              image: user.image ?? null,
          }
        : null;
    return (
        <AppLayoutShell
            sideNavIncludedIds={sideNavIncludedIds}
            showOrgSwitcher={false}
            user={reassignedUser}
            orgs={orgs}
        >
            {children}
        </AppLayoutShell>
    );
}
