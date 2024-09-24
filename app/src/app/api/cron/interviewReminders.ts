import { WorkflowData } from "@/app/(app)/(user)/workflows/_components/columns";
import { getMergentTaskName } from "@/lib/utils";
import { getTasks } from "@/server/mergent";

export async function processInterviews(data: any, workflow: WorkflowData) {
    console.log("DATA", JSON.stringify(data, null, 2));
    console.log("WORKFLOW", JSON.stringify(workflow, null, 2));

    // Get a list of already scheduled tasks to ensure there is no task already running for the application
    const tasks = (await getTasks("InterviewReminderWorkflow")) ?? [];

    const conditions = workflow.conditions.filter(
        (condition) => condition.condition_type === "Add-on",
    );

    for (const interview of data) {
        const name = getMergentTaskName(
            workflow.id,
            "Interview",
            interview.id,
            "InterviewReminderWorkflow",
        );
        // There is already an interview scheduled with this task
        if (tasks.some((task: any) => task.name === name)) continue;
    }
    console.log("TASKS", JSON.stringify(tasks, null, 2));
}
