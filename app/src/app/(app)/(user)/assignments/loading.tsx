import { AppPageLoading } from "@/app/(app)/_components/page-loading";
import { assignmentsPageConfig } from "@/app/(app)/(user)/assignments/_constants/page-config";
import { Skeleton } from "@/components/ui/skeleton";

export default function AssignmentsLoading() {
    return (
        <AppPageLoading
            title={assignmentsPageConfig.title}
            description={assignmentsPageConfig.description}
        >
            <Skeleton className="h-96 w-full" />
        </AppPageLoading>
    );
}
