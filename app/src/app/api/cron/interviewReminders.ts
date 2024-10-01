// @ts-nocheck
import { WorkflowData } from "@/app/(app)/(user)/workflows/_components/columns";
import { getMergentTaskName } from "@/lib/utils";
import { scheduleTask, getTasks, deleteTask } from "@/server/mergent";
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

export async function processInterviewReminders(
    data: any,
    workflow: WorkflowData,
) {
    let eventsScheduled = 0;

    // Get a list of already scheduled tasks for ReminderWorkflow to ensure there is no task already running for the application
    const tasks = (await getTasks("ReminderWorkflow")) ?? [];
    const orgId = workflow.organizationId;

    if (!orgId) {
        console.log("No organization ID found for workflow", workflow.id);
        return;
    }

    await Promise.all(
        tasks.map(async (task) => {
            const interviewId = task.name.split("-")[3];
            const body = JSON.parse(task.request.body);
            // We have to check if the organizationId in the task is the same as the workflow's organizationId
            if (!interviewId || body.organizationId !== orgId) {
                return;
            }

            // If the interviewid doesn't exist in the data array, the interview has been deleted and we need to delete the task
            if (interviewId && !upcomingScheduledInterview)
                await deleteTask(task.id);
            // If the interview exists, we need to check if the start or end date has changed (the interview has been rescheduled)
            // If the date has changed, we need to reschedule the task (so delete the existing one and create a new one)
            else {
                const upcomingScheduledInterview = data.find(
                    (interview: any) => interview?.id === parseInt(interviewId),
                );

                const interviewStart = new Date(interview.start.date_time);
                const interviewEnd = new Date(interview.end.date_time);
                const existingStart = new Date(
                    upcomingScheduledInterview.start.date_time,
                );
                const existingEnd = new Date(
                    upcomingScheduledInterview.end.date_time,
                );
                if (
                    interviewStart !== existingStart ||
                    interviewEnd !== existingEnd
                )
                    await deleteTask(task.id);
            }
        }),
    );

    const conditions = workflow.conditions.filter(
        (condition) => condition.condition_type === "Add-on",
    );

    const mainCondition = workflow.conditions.find(
        (condition) => condition.condition_type === "Main",
    );

    console.log("Main Interview Reminder Workflow Condition", mainCondition);

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

        // Check if the interview is already scheduled, verify that the time is the same
        // If the time is different, then we need to reschedule the task
        // Otherwise, we can skip. This task has already been scheduled
        const name = getMergentTaskName(
            `${mainCondition.time}InterviewReminderWorkflow`,
            workflow.id,
            "Interview",
            interview.id,
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
