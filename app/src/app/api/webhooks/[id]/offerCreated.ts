import { filterCandidatesDataForSlack } from "@/lib/slack";
import { getSubdomainByWorkflowID } from "@/server/actions/organization/queries";
import { getSlackTeamIDByWorkflowID } from "@/server/actions/slack/query";
import {
    fetchStuckInStageWorkflows,
    fetchWorkflowsByObjectFieldAndAlertType,
} from "@/server/actions/workflows/queries";
import {
    fetchApplicationDetails,
    fetchCandidateDetails,
    fetchCandidates,
} from "@/server/greenhouse/core";
import { sendSlackNotification } from "@/server/slack/core";
import { Condition, MainCondition } from "@/types/workflows";
import { checkConditions } from "@/utils/workflows";

export async function handleOfferCreated(data: any, orgID: string) {
    const workflows = await fetchWorkflowsByObjectFieldAndAlertType(
        orgID,
        "Offers",
        "Create/Update",
    );
    console.log("data", data);
    const offerData = data.payload.offer;

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
            offerData,
            secondaryConditions,
            getAttributeValue,
        );

        if (conditionsMet) {
            const applicationId = offerData.application_id;
            const application = await fetchApplicationDetails(applicationId);

            const slackTeamID = await getSlackTeamIDByWorkflowID(workflow.id);
            const subDomain = await getSubdomainByWorkflowID(workflow.id);
            const candidateDetails = await fetchCandidateDetails(
                application.candidate_id,
            );

            const filteredSlackDataWithMessage =
                await filterCandidatesDataForSlack(
                    [candidateDetails],
                    workflow.recipient,
                    slackTeamID,
                );

            if (filteredSlackDataWithMessage.length > 0) {
                await sendSlackNotification(
                    filteredSlackDataWithMessage,
                    workflow.recipient,
                    slackTeamID,
                    subDomain,
                    candidateDetails,
                );
            }
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
