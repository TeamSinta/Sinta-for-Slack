"use server";
import Mergent from "mergent";
import Task from "mergent/dist/types/Task";

// set the Mergent API key
const mergent = new Mergent(process.env.MERGENT_API_KEY ?? "");

export async function scheduleTask(
    url: string,
    body: any,
    date?: Date,
    name?: string,
) {
    try {
        await mergent.tasks.create({
            request: { url, body },
            ...(date && { scheduledFor: date }),
            name,
        });
        console.log("TASK SCHEDULED SUCCESSFULLY");
    } catch (error) {
        console.log("MERGENT TASK ERROR", error);
    }
}

export async function deleteTask(taskId: string) {
    try {
        await mergent.tasks.delete(taskId);
        console.log("TASK DELETED SUCCESSFULLY");
    } catch (error) {
        console.log("MERGENT TASK ERROR", error);
    }
}

// This function is obsolete - it doesn't get all the data (max 100)
// export async function getTasks(nameQuery?: string) {
//     try {
//         const tasks = await getAllTasks();
//         // console.log("TASKS", tasks);
//         if (nameQuery)
//             return tasks.filter((task: any) => task.name.includes(nameQuery));
//         return tasks;
//     } catch (error) {
//         console.log("COULD NOT RETRIEVE MERGENT TASKS", error);
//     }
// }

interface Task {
    id: string;
    created_at: string;
    name: string;
    query: string;
    request: { body: string; headers: Record<string, string>; url: string };
    scheduled_for?: string;
    status: string;
}

export async function getTasks(nameQuery?: string): Promise<Task[]> {
    const MERGENT_TASKS_URL =
        process.env.MERGENT_TASKS_URL ?? "https://api.mergent.co/v2/tasks";
    const MERGENT_API_KEY = process.env.MERGENT_API_KEY;
    if (!MERGENT_API_KEY) {
        throw new Error("MERGENT_API_KEY is not set");
    }

    let tasks: Task[] = [];
    let nextUrl: string | null = MERGENT_TASKS_URL;

    try {
        while (nextUrl) {
            const response = await fetch(nextUrl, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${MERGENT_API_KEY}`,
                },
            });

            const data = await response.json();
            if (!Array.isArray(data)) {
                throw new Error("Invalid response format");
            }

            tasks = tasks.concat(
                nameQuery
                    ? data.filter((task: any) =>
                          task?.name?.includes(nameQuery),
                      )
                    : data,
            );

            // Check if we should continue fetching: if data length is less than 100, it's the last page
            if (data.length < 100) {
                break;
            }

            nextUrl = response.headers.get("x-cursor-after")
                ? `${MERGENT_TASKS_URL}?after=${response.headers.get("x-cursor-after")}`
                : null;
        }

        return tasks;
    } catch (e) {
        console.error(`Error fetching tasks from URL: ${nextUrl}`, e);
        throw new Error("Failed to fetch tasks");
    }
}

// Delete completed tasks
async function cleanUpTasks(tasks: Task[]) {
    await Promise.all(
        tasks.map(async (task) => {
            if (task.status === "failed" || task.status === "success") {
                await deleteTask(task.id);
            }
        }),
    );
}
