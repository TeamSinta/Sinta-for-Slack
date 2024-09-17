import Mergent from "mergent";

// set the Mergent API key
const mergent = new Mergent(process.env.MERGENT_API_KEY ?? "");

export function scheduleTask(url: string, body: any, date?: Date) {
    mergent.tasks
        .create({ request: { url, body }, ...(date && { scheduledFor: date }) })
        .then((task) => console.log("TASK SUCESS", task))
        .catch((error) => console.log("MERGENT TASK ERROR", error));
}
