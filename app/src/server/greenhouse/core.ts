/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument*/
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck

import { isAfter, isBefore, isSame } from "@/lib/utils";
import { customFetch } from "@/utils/fetch";
import {
    parseISO,
    differenceInCalendarDays,
    differenceInHours,
} from "date-fns";
import { isValid } from "date-fns";

interface Candidate {
    id: number;
    first_name: string;
    last_name: string;
    applications: Application[];
    created_at: string;
    last_activity: string;
}

interface Application {
    id: number;
}

interface Condition {
    field: ConditionField;
    condition: string;
    value: string;
    unit: string;
}

interface Condition {
    field: {
        value: string;
        label: string;
    };
    condition: string;
    value: string;
    unit: string;
    conditionType: string;
}

interface ConditionField {
    value: string;
    label: string;
}

interface ActivityFeed {
    activities: Activity[];
}

interface Activity {
    id: number;
    created_at: string;
    body: string;
}

interface MockData {
    interviewer: string;
    recruiter: string;
    coordinator: string;
    hiringTeam: string;
    admin: string;
}

type FilteredCandidate = Candidate; // Adjust as per actual structure

export async function getMockGreenhouseData(): Promise<MockData> {
    try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockData: MockData = {
            recruiter: "{ Recruiter }",
            coordinator: "{ Coordinator }",
            hiringTeam: "{ Hiring_Team }",
            admin: "{ Admin }",
            interviewer: "{ Interviewer }",
        };

        return mockData;
    } catch (error) {
        console.error("Error fetching data from Greenhouse:", error);
        throw new Error("Failed to fetch data from Greenhouse");
    }
}

interface Job {
    id: number;
    name: string;
    created_at: string;
}

export const fetchJobsFromGreenhouse = async (): Promise<Job[]> => {
    try {
        const jobs = (await customFetch(
            "https://harvest.greenhouse.io/v1/jobs",
        )) as { id: number; name: string, created_at: string }[];
        return jobs.map((job) => ({
            id: job.id,
            name: job.name,
            created_at: job.created_at
        }));
    } catch (error) {
        console.error("Error fetching jobs: ", error);
        console.log('here1?')
        return [];
    }
};

interface Stage {
    id: number;
    name: string;
}

export const fetchStagesForJob = async (jobId: string): Promise<Stage[]> => {
    try {
        const stages = (await customFetch(
            `https://harvest.greenhouse.io/v1/jobs/${jobId}/stages`,
        )) as { id: number; name: string }[];
        return stages.map((stage) => ({
            id: stage.id,
            name: stage.name,
        }));
    } catch (error) {
        console.error("Error fetching stages: ", error);
        return [];
    }
};

export async function fetchCandidates(): Promise<any> {
    try {
        // Replace this URL with the actual Greenhouse API endpoint for fetching candidate details
        const response = await customFetch(
            `https://harvest.greenhouse.io/v1/candidates`,
        );
        return response;
    } catch (error) {
        console.error("Error fetching candidate details: ");
        return null;
    }
}

export async function fetchCandidateDetails(candidateId: string): Promise<any> {
    try {
        // Replace this URL with the actual Greenhouse API endpoint for fetching candidate details
        const response = await customFetch(
            `https://harvest.greenhouse.io/v1/candidates/${candidateId}`,
        );
        return response;
    } catch (error) {
        console.error("Error fetching candidate details: ", error);
        return null;
    }
}

export async function moveToNextStageInGreenhouse(
    candidateId: string,
    toStageId: string,
    greenhouseUserId: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        // Fetch the candidate details to get the current stage ID
        const candidateDetails = await fetchCandidateDetails(candidateId);
        const application = candidateDetails.applications.find(
            (app) => app.candidate_id.toString() === candidateId,
        );
        if (!application) {
            throw new Error("Application not found for the candidate.");
        }

        const fromStageId = application.current_stage.id;

        const url = `https://harvest.greenhouse.io/v1/applications/${application.id}/move`;
        const body = {
            from_stage_id: fromStageId,
            to_stage_id: parseInt(toStageId),
        };

        const response = await customFetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "On-Behalf-Of": greenhouseUserId,
            },
            body: JSON.stringify(body),
        });

        // Assume a successful response is indicated by the presence of an "id" field in the response
        if (response.id) {
            return { success: true };
        } else {
            // Extract error message from the response if available
            const errorMessage = response.message || "Unknown error";
            throw new Error(`Error moving to next stage: ${errorMessage}`);
        }
    } catch (error) {
        console.error("Error moving to next stage:", error);
        return { success: false, error: error.message };
    }
}

export async function rejectApplicationInGreenhouse(
    applicationId: string,
    greenhouseUserId: string,
    rejectReasonId: string,
    emailTemplateId: string,
    rejectComments: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        // I don't think this is a valid endpoint- need to reject the application
        // Implement your logic to reject the candidate in Greenhouse
        // For example:
        const url = `https://harvest.greenhouse.io/v1/applications/${applicationId}/reject`;
        const response = await customFetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "On-Behalf-Of": greenhouseUserId,
            },
            body: JSON.stringify({
                reason_id: rejectReasonId,
                email_template_id: emailTemplateId,
                comments: rejectComments,
            }),
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(
                `Error rejecting candidate: ${errorResponse.message}`,
            );
        }

        return { success: true };
    } catch (error) {
        console.error("Error rejecting candidate:", error);
        return { success: false, error: error.message };
    }
}
export async function rejectCandidateInGreenhouse(
    candidateId: string,
    greenhouseUserId: string,
    rejectReasonId: string,
    emailTemplateId: string,
    rejectComments: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        // I don't think this is a valid endpoint- need to reject the application
        // Implement your logic to reject the candidate in Greenhouse
        // For example:
        const url = `https://harvest.greenhouse.io/v1/candidates/${candidateId}/reject`;
        const response = await customFetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "On-Behalf-Of": greenhouseUserId,
            },
            body: JSON.stringify({
                reason_id: rejectReasonId,
                email_template_id: emailTemplateId,
                comments: rejectComments,
            }),
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(
                `Error rejecting candidate: ${errorResponse.message}`,
            );
        }

        return { success: true };
    } catch (error) {
        console.error("Error rejecting candidate:", error);
        return { success: false, error: error.message };
    }
}

export async function fetchEmailTemplates(): Promise<
    { id: number; name: string }[]
> {
    try {
        // Replace this URL with the actual Greenhouse API endpoint for fetching reject reasons
        // const queryString = new URLSearchParams({
        //     skip_count: "true",
        // }).toString();

        // const url = `https://harvest.greenhouse.io/v1/rejection_reasons?${queryString}`;
        const url = `https://harvest.greenhouse.io/v1/email_templates`;
        const response = await customFetch(url);

        const emailTemplates = response;
        if (!Array.isArray(emailTemplates)) {
            throw new Error("Invalid response format for reject reasons");
        }

        // Parse the response to send an array of objects with id and name
        return emailTemplates.map(
            (emailTemplate: { id: number; name: string }) => ({
                id: emailTemplate.id,
                name: emailTemplate.name,
            }),
        );
    } catch (error) {
        console.error("Error fetching reject reasons: ", error);
        return [];
    }
}
export async function fetchRejectReasons(): Promise<
    { id: number; name: string }[]
> {
    try {
        // Replace this URL with the actual Greenhouse API endpoint for fetching reject reasons
        const queryString = new URLSearchParams({
            include_defaults: "true",
        }).toString();

        const url = `https://harvest.greenhouse.io/v1/rejection_reasons?${queryString}`;

        const response = await customFetch(url);
        const rejectReasons = response;
        if (!Array.isArray(rejectReasons)) {
            throw new Error("Invalid response format for reject reasons");
        }

        // Parse the response to send an array of objects with id and name
        return rejectReasons.map((reason: { id: number; name: string }) => ({
            id: reason.id,
            name: reason.name,
        }));
    } catch (error) {
        console.error("Error fetching reject reasons: ", error);
        return [];
    }
}

export async function fetchGreenhouseUsers(): Promise<
    Record<string, { id: string; email: string; name: string }>
> {
    try {
        const users = (await customFetch(
            "https://harvest.greenhouse.io/v1/users",
        )) as { id: string; primary_email_address: string; name: string }[];
        return users.reduce(
            (
                acc: Record<
                    string,
                    { id: string; email: string; name: string }
                >,
                user,
            ) => {
                if (user.primary_email_address) {
                    acc[user.id] = {
                        id: user.id,
                        email: user.primary_email_address,
                        name: user.name,
                    };
                }
                return acc;
            },
            {},
        );
    } catch (error) {
        console.error("Error fetching Greenhouse users: ");
        return {};
    }
}

export async function matchSlackToGreenhouseUsers(
    greenhouseUsers: Record<string, { id: string; email: string }>,
    slackUsers: { value: string; label: string; email: string }[],
): Promise<Record<string, string>> {
    const greenhouseUserMap: Record<string, string> = {};
    for (const [, user] of Object.entries(greenhouseUsers)) {
        greenhouseUserMap[user.email] = user.id; // Map email to Greenhouse user ID
    }

    const userMapping: Record<string, string> = {};
    for (const slackUser of slackUsers) {
        if (greenhouseUserMap[slackUser.email]) {
            userMapping[slackUser.value] = greenhouseUserMap[slackUser.email]; // Use Slack user ID as the key
        }
    }
    return userMapping;
}

export function mapWebhookActionToObjectField(action: string): string {
    switch (action) {
        case "application_updated":
            return "Application";
        case "candidate_hired":
            return "Candidate";
        case "candidate_unhired":
            return "Candidate";
        case "candidate_changed_stage":
            return "Candidate Stage";
        case "candidate_submitted_application":
            return "Application Submission";
        case "candidate_rejected":
        case "prospect_rejected":
            return "Rejection";
        case "candidate_unrejected":
        case "prospect_unrejected":
            return "Unrejection";
        case "candidate_updated":
        case "prospect_updated":
            return "Candidate Update";
        case "delete_candidate":
            return "Candidate Deletion";
        case "interview_deleted":
            return "Interview Deletion";
        case "job_interview_stage_deleted":
            return "Job Interview Stage Deletion";
        case "prospect_created":
            return "Prospect Creation";
        default:
            return "";
    }
}

export async function fetchData<T>(apiUrl: string): Promise<T> {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
        const data = await response.json();
        return data as T;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw new Error("Failed to fetch data");
    }
}

export function processData<T extends Record<string, unknown>>(
    data: T[],
    processor: keyof T,
): Partial<T>[] {
    if (!data.length) {
        throw new Error(`Data is empty.`);
    }
    if (!(processor in data[0])) {
        throw new Error(
            `Processor field "${String(processor)}" not found in the data.`,
        );
    }

    const processedData = data.filter((item) => {
        const field = item[processor];
        if (typeof field === "string") {
            return field.toLowerCase().includes("your_filter_value");
        }
        return false;
    });

    return processedData.map((item) => ({
        [processor]: item[processor],
    }));
}

function isISODate(dateStr: string): boolean {
    const date = parseISO(dateStr);
    return isValid(date);
}

export const filterDataWithConditions = (
    candidates: Candidate[],
    conditions: Condition[],
): FilteredCandidate[] => {
    return candidates.filter((candidate) => {
        for (const condition of conditions) {
            if (condition.conditionType !== "main") {
                continue; // Ignore non-main conditions for now
            }

            const fieldValue = candidate[condition.field.value];

            if (
                typeof fieldValue === "string" &&
                (condition.condition === "after" ||
                    condition.condition === "before" ||
                    condition.condition === "same")
            ) {
                const value = parseInt(condition.value, 10);
                if (
                    condition.condition === "after" &&
                    !isAfter(fieldValue, value, condition.unit)
                ) {
                    return false;
                }
                if (
                    condition.condition === "before" &&
                    !isBefore(fieldValue, value, condition.unit)
                ) {
                    return false;
                }
                if (
                    condition.condition === "same" &&
                    !isSame(fieldValue, value, condition.unit)
                ) {
                    return false;
                }
            }
        }
        return true;
    });
};
export async function fetchAllGreenhouseUsers(): Promise<
    Record<string, { id: string; email: string }>
> {
    try {
        const users = (await customFetch(
            "https://harvest.greenhouse.io/v1/users",
        ))
        return users

    } catch (error) {
        console.error("Error fetching Greenhouse users: ", error);
        return {};
    }
}


export const fetchAllGreenhouseJobsFromGreenhouse = async (): Promise<Job[]> => {
    try {
        const jobs = (await customFetch(
            "https://harvest.greenhouse.io/v1/jobs",
        )) as any[];
        return jobs
    } catch (error) {
        console.error("Error fetching jobs: ", error);
        return [];
    }
};
async function fetchActivityFeed(candidateId: number): Promise<ActivityFeed> {
    const response = await customFetch(
        `https://harvest.greenhouse.io/v1/candidates/${candidateId}/activity_feed`,
        {},
    );
    return response as ActivityFeed;
}

function calculateTimeInCurrentStage(
    currentStage: string,
    activities: Activity[],
): number {
    let stageStartDate: Date | null = null;

    // Iterate through activities in reverse order to find the most recent matching stage change
    for (let i = activities.length - 1; i >= 0; i--) {
        const activity = activities[i];
        const stageChangeMatch = activity.body.match(/was moved into (.+) for/);

        if (stageChangeMatch) {
            const newStage = stageChangeMatch[1];
            if (newStage === currentStage) {
                stageStartDate = new Date(activity.created_at);
                break;
            }
        }
    }

    if (stageStartDate) {
        const now = new Date();
        const duration = Math.floor(
            (now.getTime() - stageStartDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        return duration;
    } else {
        // Return a large negative number if the stageStartDate is not found
        return Number.NEGATIVE_INFINITY;
    }
}

export async function filterStuckinStageDataConditions(
    candidates: Candidate[],
    conditions: Condition[],
): Promise<Candidate[]> {
    const matchedCandidates: Candidate[] = [];

    const condition = conditions[0];
    if (condition == null) {
        return matchedCandidates;
    }

    const stageName = condition.field.label;
    const thresholdDays = parseInt(condition.value, 10);
    const operator = condition.operator;

    for (const candidate of candidates) {
        const candidateId = candidate.id;
        const activityFeed = await fetchActivityFeed(candidateId);
        const application = candidate.applications.find(
            (app) => app.current_stage.name === stageName,
        );
        if (application) {
            const currentStage = application.current_stage.name;
            const daysInCurrentStage = calculateTimeInCurrentStage(
                currentStage,
                activityFeed.activities,
            );

            let conditionMet = false;

            switch (operator) {
                case "greaterThan":
                    conditionMet = daysInCurrentStage > thresholdDays;
                    break;
                case "lessThan":
                    conditionMet = daysInCurrentStage < thresholdDays;
                    break;
                case "greaterThanOrEqual":
                    conditionMet = daysInCurrentStage >= thresholdDays;
                    break;
                case "lessThanOrEqual":
                    conditionMet = daysInCurrentStage <= thresholdDays;
                    break;
                case "equals":
                    conditionMet = daysInCurrentStage === thresholdDays;
                    break;
                case "notEqual":
                    conditionMet = daysInCurrentStage !== thresholdDays;
                    break;
                default:
                    console.warn(`Unsupported condition operator: ${operator}`);
            }
            console.log(operator, daysInCurrentStage, thresholdDays, conditionMet)

            if (conditionMet) {
                matchedCandidates.push(candidate);
            }
        }
    }

    return matchedCandidates;
}

export const filterScheduledInterviewsWithConditions = (
    data: Record<string, unknown>[],
    conditions: Condition[],
): Record<string, unknown>[] => {
    const today = new Date();

    return data.filter((item) => {
        return conditions.every((condition) => {
            const { field, condition: operator, value, unit } = condition;

            console.log("Processing condition:", condition);

            // Adjust the field value to match the data object structure
            let itemValue;
            if (field.value.includes(".")) {
                const keys = field.value.split(".");
                itemValue = keys.reduce(
                    (obj, key) => (obj ? obj[key] : undefined),
                    item,
                );
            } else {
                itemValue = item[field.value] ?? item[field.label];
            }

            console.log("Item value for field", field.value, ":", itemValue);

            if (!itemValue) {
                console.log("Item value is empty for field", field.value);
                return false;
            }

            if (isISODate(String(itemValue))) {
                const fieldValueAsDate = parseISO(String(itemValue));
                const valueAsNumber = parseInt(value, 10);

                console.log("Field value as date:", fieldValueAsDate);

                if (unit === "Days") {
                    switch (operator) {
                        case "before":
                            return (
                                differenceInCalendarDays(
                                    today,
                                    fieldValueAsDate,
                                ) < -valueAsNumber
                            );
                        case "after":
                            return (
                                differenceInCalendarDays(
                                    today,
                                    fieldValueAsDate,
                                ) > -valueAsNumber
                            );
                        case "same":
                            return (
                                differenceInCalendarDays(
                                    today,
                                    fieldValueAsDate,
                                ) === -valueAsNumber
                            );
                        default:
                            return false;
                    }
                } else if (unit === "Hours") {
                    console.log("Today:", today);
                    console.log("Field value as date:", fieldValueAsDate);
                    switch (operator) {
                        case "before":
                            return (
                                differenceInHours(today, fieldValueAsDate) <
                                -valueAsNumber
                            );
                        case "after":
                            return (
                                differenceInHours(today, fieldValueAsDate) >
                                -valueAsNumber
                            );
                        case "same":
                            return (
                                differenceInHours(today, fieldValueAsDate) === 0
                            );
                        default:
                            return false;
                    }
                }
            }

            switch (operator) {
                case "equals":
                    return itemValue === value;
                case "notEqual":
                    return itemValue !== value;
                case "greaterThan":
                    return itemValue > value;
                case "lessThan":
                    return itemValue < value;
                case "greaterThanOrEqual":
                    return itemValue >= value;
                case "lessThanOrEqual":
                    return itemValue <= value;
                case "contains":
                    return (
                        typeof itemValue === "string" &&
                        itemValue.includes(value)
                    );
                default:
                    return false;
            }
        });
    });
};
