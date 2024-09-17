import { AppPageLoading } from "@/app/(app)/_components/page-loading";

import { Skeleton } from "@/components/ui/skeleton";
import { adminDashConfig } from "../_constants/page-config";

export default function AdminFeedbackPageLoading() {
    return (
        <AppPageLoading
            title={adminDashConfig.title}
            description={adminDashConfig.description}
        >
            <Skeleton className="h-96 w-full" />
        </AppPageLoading>
    );
}
