/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { customFetch } from '@/app/api/cron/route';
import { parseISO, differenceInCalendarDays } from 'date-fns';
import { isDate, isValid } from 'date-fns';


interface Condition {
  field: string;
  condition: string;
  value: string | number; // Assuming the value could be a number when the condition is about dates
}

export async function getMockGreenhouseData(): Promise<{
  owner: any; recruiter: string, coordinator: string, hiringTeam: string, admin: string
}> {
  try {
    // Simulated delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock data without image tags
    const mockData = {
      recruiter: "{ Recruiter }",
      coordinator: "{ Coordinator }",
      hiringTeam: "{ Hiring_Team }",
      admin: "{ Admin }",
      owner: "{ Record_Owner }"
    };

    return mockData;
  } catch (error) {
    console.error('Error fetching data from Greenhouse:', error);
    return null; // Returning null in case of error for clearer error handling
  }
}

export const fetchJobsFromGreenhouse = async (): Promise<Job[]> => {
  try {
      const jobs = await customFetch('https://harvest.greenhouse.io/v1/jobs');
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
      const stages = await customFetch(`https://harvest.greenhouse.io/v1/jobs/${jobId}/stages`);
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
export const filterDataWithConditions = (data: any[], conditions: Condition[]): any[] => {
  const today = new Date();

  return data.filter(item => {
    return conditions.every(condition => {
      const { field, condition: operator, value, unit } = condition;
      const itemValue = item[field];

      // Date conditions processing
      if (isISODate(itemValue) && unit === "Days") {
        const fieldValueAsDate = parseISO(itemValue);
        const valueAsNumber = parseInt(value as string, 10); // Ensure the value is treated as a number for date comparisons

        switch (operator) {
          case "before":
            // Field value date should be more than 'value' days ago from today
            // If valueAsNumber is 1, differenceInCalendarDays(today, fieldValueAsDate) should be less than -1
            return differenceInCalendarDays(today, fieldValueAsDate) < -valueAsNumber;
          case "after":
            // Field value date should be less than 'value' days ago from today
            // If valueAsNumber is 1, differenceInCalendarDays(today, fieldValueAsDate) should be greater than -1
            return differenceInCalendarDays(today, fieldValueAsDate) > -valueAsNumber;
          case "sameDay":
            // Field value date should be exactly 'value' days ago from today
            return differenceInCalendarDays(today, fieldValueAsDate) === -valueAsNumber;
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
          return typeof itemValue === 'string' && itemValue.includes(value as string);
        default:
          return false;
      }
    });
  });
};
