// @ts-nocheck
import { WorkflowData } from "@/app/(app)/(user)/workflows/_components/columns";
import { getMergentTaskName } from "@/lib/utils";
import { scheduleTask, getTasks } from "@/server/mergent";
import { checkCondtions } from "@/utils/workflows";
import { z } from "zod";
import { adjustDateTime } from "@/lib/utils";
const interviewReminderMainConditionSchema = z.object({
    time: z.enum(["before", "after"]),
    days: z.string().transform((val) => {
        const parsed = parseInt(val, 10);
        if (isNaN(parsed)) {
            throw new Error("Invalid number format for days");
        }
        return parsed;
    }),
    hours: z.string().transform((val) => {
        const parsed = parseInt(val, 10);
        if (isNaN(parsed)) {
            throw new Error("Invalid number format for hours");
        }
        return parsed;
    }),
    condition_type: z.literal("Main"),
});

export async function processInterviews(data: any, workflow: WorkflowData) {
    // console.log("DATA", JSON.stringify(data, null, 2));
    // console.log("WORKFLOW", JSON.stringify(workflow, null, 2));
    let eventsScheduled = 0;

    // Get a list of already scheduled tasks for InterviewReminderWorkflow to ensure there is no task already running for the application
    const tasks = (await getTasks("InterviewReminderWorkflow")) ?? [];
    const conditions = workflow.conditions.filter(
        (condition) => condition.condition_type === "Add-on",
    );

    const mainCondition = workflow.conditions.find(
        (condition) => condition.condition_type === "Main",
    );
    console.log("MAIN CONDITION", mainCondition);
    const {
        time,
        days,
        hours,
    }: { time: "before" | "after"; days: number; hours: number } =
        interviewReminderMainConditionSchema.parse(mainCondition);

    for (const interview of data) {
        // Check if the interview object satisfies the conditions
        const satisfiesConditions = checkCondtions(
            interview,
            conditions,
            getAttributeValue,
        );
        if (
            !satisfiesConditions ||
            !interview?.start?.date_time ||
            !interview?.end?.date_time
        )
            continue;

        // Check if the interview is already scheduled
        const name = getMergentTaskName(
            workflow.id,
            "Interview",
            interview.id,
            "InterviewReminderWorkflow",
        );
        // There is already an interview scheduled with this task
        if (tasks.some((task: any) => task.name === name)) continue;

        // Otherwise, schedule the reminder task
        const endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workflows/interview-reminder`;
        let triggerDate;
        if (time === "before") {
            const interviewStart = new Date(interview.start.date_time);
            triggerDate = adjustDateTime(interviewStart, time, days, hours);
        } else if (time === "after") {
            const interviewEnd = new Date(interview.end.date_time);
            triggerDate = adjustDateTime(interviewEnd, time, days, hours);
        }

        try {
            await scheduleTask(
                endpoint,
                JSON.stringify({ interview, workflow }),
                triggerDate,
                name,
            );
            eventsScheduled++;
        } catch (error) {}
    }
    console.log(
        `${eventsScheduled} Interview Reminder Workflow ${workflow.id} events scheduled`,
    );
}

function getAttributeValue(object: any, attributePath: string) {
    const keys = attributePath.split(".");

    let currentObject = object;

    for (let key of keys) {
        if (key.endsWith("[]")) {
            // Handle array access
            const arrayKey = key.slice(0, -2); // Strip "[]"
            if (!Array.isArray(currentObject[arrayKey])) {
                return undefined; // Return undefined if not an array
            }
            currentObject = currentObject[arrayKey].map((item) =>
                getAttributeValue(
                    item,
                    keys.slice(keys.indexOf(key) + 1).join("."),
                ),
            );
            return currentObject;
        }

        if (currentObject === undefined || currentObject === null) {
            return undefined; // Return undefined if any part of the path is invalid
        }

        currentObject = currentObject[key];
    }

    return currentObject;
}
