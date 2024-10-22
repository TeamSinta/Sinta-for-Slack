import { getOrganizationWebhooks } from "@/server/actions/organization/queries";
import WorkflowLoader from "../_components/workflow-loader";

export default async function NewWorkflowPage({
    params,
}: {
    params: { workflowId?: string };
}) {
    // Determine if we are in edit mode based on the presence of the workflowId
    const edit = !!params.workflowId; // edit is true if workflowId exists, otherwise false
    const workflowId = params.workflowId ?? null; // workflowId is null if not provided
    const activeWebhooks = await getOrganizationWebhooks();

    return (
        <div className="h-full w-full">
            <WorkflowLoader
                workflowId={workflowId ?? ""}
                edit={edit}
                activeWebhooks={activeWebhooks ?? []}
            />
        </div>
    );
}
