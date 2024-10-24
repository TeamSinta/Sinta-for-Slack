"use client";

import { Sidebar, SidebarLoading } from "@/app/(app)/_components/sidebar";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion"; // Import Framer Motion for transitions
import { Suspense } from "react";
import { Organization, User } from "@/server/db/schema";

type AppLayoutProps = {
    children: React.ReactNode;
    sideNavRemoveIds?: string[];
    sideNavIncludedIds?: string[];
    showOrgSwitcher?: boolean;
    isWorkflowBuilder?: boolean;
    user?: User | null;
    orgs: { currentOrg: Organization | null; userOrgs: Organization[] };
};

/**
 * @purpose The app shell component contains sidebar nav info and the main content of the app
 * to add a new component in app shell and use it in the `AppShell` component it will apply to all the app pages
 *
 * @param children the main content of the app
 * @param sideNavIncludedIds the ids of the sidebar nav items to include in the sidebar specifically @get ids from the sidebar config
 * @param sideNavRemoveIds the ids of the sidebar nav items to remove from the sidebar specifically @get ids from the sidebar config
 * @param isWorkflowBuilder boolean flag to determine if WorkflowBuilder is being used
 *
 */

export function AppLayoutShell({
    children,
    sideNavIncludedIds,
    sideNavRemoveIds,
    showOrgSwitcher,
    user,
    orgs,
}: AppLayoutProps) {
    const pathname = usePathname();
    let isWorkflowBuilder = false;

    // Determine if it's the workflow builder based on the pathname
    if (
        pathname === "/hiringrooms/form/new" ||
        pathname.includes("/workflows/new")
    ) {
        isWorkflowBuilder = true;
    }

    // Sidebar transition variants
    const sidebarVariants = {
        hidden: { x: -100, opacity: 0 },
        visible: { x: 0, opacity: 1, transition: { duration: 0.5 } },
    };

    // Children content transition variants
    const contentVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
    };

    return (
        <div
            className={`flex items-start ${isWorkflowBuilder ? "" : "container"}`}
        >
            {!isWorkflowBuilder && (
                <motion.div
                    className="sticky left-0 top-0 h-screen w-60 flex-shrink-0"
                    variants={sidebarVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Suspense fallback={<SidebarLoading />}>
                        <Sidebar
                            sidebarNavIncludeIds={sideNavIncludedIds}
                            sidebarNavRemoveIds={sideNavRemoveIds}
                            showOrgSwitcher={showOrgSwitcher}
                            user={user}
                            orgs={orgs}
                        />
                    </Suspense>
                </motion.div>
            )}

            <motion.section
                className={`min-h-screen flex-grow ${isWorkflowBuilder ? "" : "container"}`}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
            >
                {children}
            </motion.section>
        </div>
    );
}
