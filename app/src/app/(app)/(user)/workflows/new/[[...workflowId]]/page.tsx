import WorkflowLoader from "../_components/workflow-loader";

export default function NewWorkflowPage({
    params,
}: {
    params: { workflowId?: string };
}) {
    // Determine if we are in edit mode based on the presence of the workflowId
    const edit = !!params.workflowId; // edit is true if workflowId exists, otherwise false
    const workflowId = params.workflowId || null; // workflowId is null if not provided

    return (
        <div className="h-full w-full">
            <WorkflowLoader workflowId={workflowId || ""} edit={edit} />
        </div>
    );
}
