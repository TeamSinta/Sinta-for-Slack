"use server";
import Mergent from "mergent";

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

export async function getTasks(nameQuery?: string) {
    try {
        const tasks = await mergent.tasks.list();
        // console.log("TASKS", tasks);
        if (nameQuery)
            return tasks.filter((task: any) => task.name.includes(nameQuery));
        return tasks;
    } catch (error) {
        console.log("COULD NOT RETRIEVE MERGENT TASKS", error);
    }
}
