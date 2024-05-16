import { customFetch } from "@/app/api/cron/route";
import { parseISO, differenceInCalendarDays } from "date-fns";
import { isValid } from "date-fns";

interface Candidate {
    id: number;
    first_name: string;
    last_name: string;
    applications: Application[];
    // other fields...
}

interface Application {
    id: number;
    // other fields...
}

interface Condition {
    field: ConditionField;
    condition: string;
    value: string;
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
    // other fields...
}

export async function getMockGreenhouseData(): Promise<{
    owner: any;
    recruiter: string;
    coordinator: string;
    hiringTeam: string;
    admin: string;
}> {
    try {
        // Simulated delay to mimic API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data without image tags
        const mockData = {
            recruiter: "{ Recruiter }",
            coordinator: "{ Coordinator }",
            hiringTeam: "{ Hiring_Team }",
            admin: "{ Admin }",
            owner: "{ Record_Owner }",
        };

        return mockData;
    } catch (error) {
        console.error("Error fetching data from Greenhouse:", error);
        return; // Returning null in case of error for clearer error handling
    }
}

export const fetchJobsFromGreenhouse = async (): Promise<Job[]> => {
    try {
        const jobs = await customFetch("https://harvest.greenhouse.io/v1/jobs");
        return jobs.map((job: any) => ({
            id: job.id,
            name: job.name,
        }));
    } catch (error) {
        console.error("Error fetching jobs: ", error);
        return [];
    }
};

export const fetchStagesForJob = async (jobId: string): Promise<Stage[]> => {
    try {
        const stages = await customFetch(
            `https://harvest.greenhouse.io/v1/jobs/${jobId}/stages`,
        );
        return stages.map((stage: any) => ({
            id: stage.id,
            name: stage.name,
        }));
    } catch (error) {
        console.error("Error fetching stages: ", error);
        return [];
    }
};

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
        // Add more cases for other actions as needed
        default:
            return "";
    }
}

export async function fetchData(apiUrl: string): Promise<any> {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching data:", error);
        throw new Error("Failed to fetch data");
    }
}

// Function to process data based on the provided processor
export function processData(data: any[], processor: string): any[] {
    if (!data.length) {
        throw new Error(`Data is empty.`);
    }
    if (!(processor in data[0])) {
        throw new Error(
            `Processor field "${processor}" not found in the data.`,
        );
    }

    const processedData = data.filter((item: any) => {
        const field = processor.toLowerCase();
        if (typeof item[field] === "string") {
            return item[field].toLowerCase().includes("your_filter_value");
        }
        return false;
    });
    const filteredData = processedData.map((item: any) => {
        return { [processor]: item[processor] };
    });

    return filteredData;
}

/**
 * Determines if a string is a valid ISO date.
 * @param dateStr The string to check.
 * @returns true if the string is a valid ISO date, false otherwise.
 */
function isISODate(dateStr: string): boolean {
    const date = parseISO(dateStr);
    return isValid(date);
}

/**
 * Filters data based on a list of conditions, including dynamic date comparisons.
 *
 * @param data - The array of data objects fetched from an API.
 * @param conditions - The conditions to apply for filtering.
 * @returns - The filtered array of data objects.
 */
export const filterDataWithConditions = (
    data: any[],
    conditions: Condition[],
): any[] => {
    const today = new Date();

    return data.filter((item) => {
        return conditions.every((condition) => {
            const { field, condition: operator, value, unit } = condition;
            const itemValue = item[field.label]
                ? item[field.label]
                : item[field];

            // Date conditions processing
            if (isISODate(itemValue) && unit === "Days") {
                const fieldValueAsDate = parseISO(itemValue);
                const valueAsNumber = parseInt(value, 10); // Ensure the value is treated as a number for date comparisons

                switch (operator) {
                    case "before":
                        // Field value date should be more than 'value' days ago from today
                        // If valueAsNumber is 1, differenceInCalendarDays(today, fieldValueAsDate) should be less than -1
                        return (
                            differenceInCalendarDays(today, fieldValueAsDate) <
                            -valueAsNumber
                        );
                    case "after":
                        // Field value date should be less than 'value' days ago from today
                        // If valueAsNumber is 1, differenceInCalendarDays(today, fieldValueAsDate) should be greater than -1
                        return (
                            differenceInCalendarDays(today, fieldValueAsDate) >
                            -valueAsNumber
                        );
                    case "sameDay":
                        // Field value date should be exactly 'value' days ago from today
                        return (
                            differenceInCalendarDays(
                                today,
                                fieldValueAsDate,
                            ) === -valueAsNumber
                        );
                }
            }

            // Non-date values or if the date check does not pass
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

async function fetchActivityFeed(candidateId: number): Promise<ActivityFeed> {
    const response = await customFetch(
        `https://harvest.greenhouse.io/v1/candidates/${candidateId}/activity_feed`,
        {},
    );
    return response; // Directly use the response as JSON
}

function calculateTimeInStages(activities: Activity[]): Record<string, number> {
    const stageDurations: Record<string, number> = {};
    let currentStage = "Initial Stage"; // Starting stage name
    let stageStartDate: Date | null = null;

    console.log();
    activities.forEach((activity) => {
        console.log(activity.body);
        const stageChangeMatch = activity.body.match(/was moved into (.+) for/);
        if (stageChangeMatch) {
            const newStage = stageChangeMatch[1];
            const createdAt = new Date(activity.created_at);

            if (stageStartDate) {
                const duration = Math.floor(
                    (createdAt.getTime() - stageStartDate.getTime()) /
                        (1000 * 60 * 60 * 24),
                ); // in days
                if (!stageDurations[currentStage]) {
                    stageDurations[currentStage] = 0;
                }
                stageDurations[currentStage] += duration;
            }

            currentStage = newStage;
            stageStartDate = createdAt;
        }
    });

    // Calculate time in the last stage till today if necessary
    if (stageStartDate) {
        const now = new Date();
        const duration = Math.floor(
            (now.getTime() - stageStartDate.getTime()) / (1000 * 60 * 60 * 24),
        ); // in days
        if (!stageDurations[currentStage]) {
            stageDurations[currentStage] = 0;
        }
        stageDurations[currentStage] += duration;
    }

    console.log(stageDurations);

    return stageDurations;
}

export async function filterStuckinStageDataConditions(
    candidates: Candidate[],
    conditions: Condition[],
): Promise<Candidate[]> {
    const matchedCandidates: Candidate[] = [];

    const condition = conditions[0];
    const stageName = condition.field.label;
    const thresholdDays = parseInt(condition.value, 10);

    for (const candidate of candidates) {
        const candidateId = candidate.id;
        const activityFeed = await fetchActivityFeed(candidateId);
        const stageDurations = calculateTimeInStages(activityFeed.activities);
        console.log(thresholdDays);
        if (
            stageDurations[stageName] &&
            stageDurations[stageName] > thresholdDays
        ) {
            matchedCandidates.push(candidate);
        }
    }

    return matchedCandidates;
}
