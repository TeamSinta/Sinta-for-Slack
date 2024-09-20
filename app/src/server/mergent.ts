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
