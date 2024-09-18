import Mergent from "mergent";

// set the Mergent API key
const mergent = new Mergent(process.env.MERGENT_API_KEY ?? "");

export function scheduleTask(
    url: string,
    body: any,
    date?: Date,
    name?: string,
) {
    mergent.tasks
        .create({
            request: { url, body },
            ...(date && { scheduledFor: date }),
            name,
        })
        .then((task) => console.log("TASK SCHEDULED SUCESSFULLY"))
        .catch((error) => console.log("MERGENT TASK ERROR", error));
}

export function deleteTask(taskId: string) {
    mergent.tasks
        .delete(taskId)
        .then((task) => console.log("TASK DELETED SUCESSFULLY"))
        .catch((error) => console.log("MERGENT TASK ERROR", error));
}
