'use client'; // Ensure it's a client component

import { usePathname } from 'next/navigation'; // Import usePathname to get the current URL
import { Suspense } from 'react';
import { Sidebar, SidebarLoading } from './sidebar'; // Ensure these are correctly imported

type SidebarCheckerProps = {
  sideNavRemoveIds?: string[];
  sideNavIncludedIds?: string[];
  showOrgSwitcher?: boolean;
};

export default function SidebarChecker({
  sideNavRemoveIds,
  sideNavIncludedIds,
  showOrgSwitcher,
}: SidebarCheckerProps) {
  const pathname = usePathname(); // Get the current URL

  console.log(sideNavIncludedIds)
  console.log(sideNavRemoveIds)
  // If the current URL matches "/hiringrooms/form", return null (i.e., don't render the sidebar)
  if (pathname === '/hiringrooms/form') {
    return null;
  }

  // Otherwise, render the sidebar
  return (
    <div className="sticky left-0 top-0 h-screen w-60 flex-shrink-0">
      <Suspense fallback={<SidebarLoading />}>
        <Sidebar
          sidebarNavIncludeIds={sideNavIncludedIds}
          sidebarNavRemoveIds={sideNavRemoveIds}
          showOrgSwitcher={showOrgSwitcher}
        />
      </Suspense>
    </div>
  );
}
