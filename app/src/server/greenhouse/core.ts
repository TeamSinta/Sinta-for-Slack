/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { parseISO, differenceInCalendarDays } from "date-fns";
import { isValid } from "date-fns";
import { env } from "process";

interface Candidate {
    id: number;
    first_name: string;
    last_name: string;
    applications: Application[];
}

interface Application {
    id: number;
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
}

interface MockData {
    owner: string;
    recruiter: string;
    coordinator: string;
    hiringTeam: string;
    admin: string;
}

const API_TOKEN = env.GREENHOUSE_API_HARVEST;

interface CustomFetchOptions extends RequestInit {
    headers?: HeadersInit;
}

 const customFetch = async (
  url: string,
  options: CustomFetchOptions = {}
): Promise<Record<string, unknown>[]> => {
  const headers: HeadersInit = {
    Authorization: `Basic ${btoa(API_TOKEN + ":")}`, // Encode API token for Basic Auth
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  };

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const responseData = (await response.json()) as Record<string, unknown>[];
  return responseData;
};


export async function getMockGreenhouseData(): Promise<MockData> {
    try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockData: MockData = {
            recruiter: "{ Recruiter }",
            coordinator: "{ Coordinator }",
            hiringTeam: "{ Hiring_Team }",
            admin: "{ Admin }",
            owner: "{ Record_Owner }",
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
}

export const fetchJobsFromGreenhouse = async (): Promise<Job[]> => {
    try {
        const jobs = await customFetch("https://harvest.greenhouse.io/v1/jobs") as { id: number; name: string }[];
        return jobs.map((job) => ({
            id: job.id,
            name: job.name,
        }));
    } catch (error) {
        console.error("Error fetching jobs: ", error);
        return [];
    }
};

interface Stage {
    id: number;
    name: string;
}

export const fetchStagesForJob = async (jobId: string): Promise<Stage[]> => {
    try {
        const stages = await customFetch(`https://harvest.greenhouse.io/v1/jobs/${jobId}/stages`) as { id: number; name: string }[];
        return stages.map((stage) => ({
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
        throw new Error(`Processor field "${String(processor)}" not found in the data.`);
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
    data: Record<string, unknown>[],
    conditions: Condition[],
): Record<string, unknown>[] => {
    const today = new Date();

    return data.filter((item) => {
        return conditions.every((condition) => {
            const { field, condition: operator, value, unit } = condition;
            const itemValue = item[field.label] ?? item[field.value];

            if (isISODate(String(itemValue)) && unit === "Days") {
                const fieldValueAsDate = parseISO(String(itemValue));
                const valueAsNumber = parseInt(value, 10);

                switch (operator) {
                    case "before":
                        return differenceInCalendarDays(today, fieldValueAsDate) < -valueAsNumber;
                    case "after":
                        return differenceInCalendarDays(today, fieldValueAsDate) > -valueAsNumber;
                    case "sameDay":
                        return differenceInCalendarDays(today, fieldValueAsDate) === -valueAsNumber;
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

async function fetchActivityFeed(candidateId: number): Promise<ActivityFeed> {
    const response = await customFetch(
        `https://harvest.greenhouse.io/v1/candidates/${candidateId}/activity_feed`,
        {},
    );
    return response as ActivityFeed;
}

function calculateTimeInStages(activities: Activity[]): Record<string, number> {
  const stageDurations: Record<string, number> = {};
  let currentStage = "Initial Stage";
  let stageStartDate: Date | null = null;

  activities.forEach((activity) => {
      const stageChangeMatch = activity.body.match(/was moved into (.+) for/);
      if (stageChangeMatch) {
          const newStage = stageChangeMatch[1];
          const createdAt = new Date(activity.created_at);

          if (stageStartDate) {
              const duration = Math.floor(
                  (createdAt.getTime() - stageStartDate.getTime()) / (1000 * 60 * 60 * 24),
              );
              if (!stageDurations[currentStage]) {
                  stageDurations[currentStage] = 0;
              }
              stageDurations[currentStage] += duration;
          }

          currentStage = newStage;
          stageStartDate = createdAt;
      }
  });

  if (stageStartDate) {
      const now = new Date();
      const duration = Math.floor(
          (now.getTime() - stageStartDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (!stageDurations[currentStage]) {
          stageDurations[currentStage] = 0;
      }
      stageDurations[currentStage] += duration;
  }

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
        if (stageDurations[stageName] && stageDurations[stageName] > thresholdDays) {
            matchedCandidates.push(candidate);
        }
    }

    return matchedCandidates;
}
