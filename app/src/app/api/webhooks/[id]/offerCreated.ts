import { fetchStuckInStageWorkflows } from "@/server/actions/workflows/queries";
import { Condition, MainCondition } from "@/types/workflows";
import { checkConditions } from "@/utils/workflows";

export async function handleOfferCreated(data: any, orgID: string) {
    const workflows = await fetchStuckInStageWorkflows(orgID);
    console.log("data", data);

    const payload = data.payload;

    for (const workflow of workflows) {
        const { conditions } = workflow as {
            id: string;
            conditions: (Condition | MainCondition)[];
        };

        // Check the conditions, if they're all satisfied, send the notification
        const secondaryConditions = conditions.filter(
            (c: any) => c.condition_type === "Add-on",
        );

        const conditionsMet = checkConditions(
            payload,
            secondaryConditions,
            getAttributeValue,
        );

        if (conditionsMet) {
            const application = await 
        } else {
            console.log(
                `Created offer did not meet conditions for workflow "${workflow.name}".`,
            );
        }
    }

    console.log("Offer Created Webhook processing complete.");
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
