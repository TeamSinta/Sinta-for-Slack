/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { parseISO, differenceInCalendarDays } from 'date-fns';
import { isDate, isValid } from 'date-fns';


interface Condition {
  field: string;
  condition: string;
  value: string | number; // Assuming the value could be a number when the condition is about dates
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



// Function to send a Slack notification
export async function sendSlackNotification(
    data: any,
    recipient: any,
): Promise<void> {
    // Implement Slack notification sending logic
    // Use the recipient information to send the notification
    // Example: Send Slack message to recipient using Slack API
    console.log("Sending Slack notification to:", recipient);
    console.log("Notification Data:", data);
    // Placeholder, replace with actual logic
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
  return data.filter(item => {
      return conditions.every(condition => {
          const { field, condition: operator, value, unit } = condition;
          const itemValue = item[field];

          // Check if the field's value is a date and the condition involves time units
          if (isISODate(itemValue) && unit === "Days") {
              const fieldValueAsDate = parseISO(itemValue);
              const today = new Date();
              const valueAsNumber = Number(value); // Ensure the value is treated as a number for date comparisons

              // Applying different logic based on the operator
              switch (operator) {
                  case "after":
                      return differenceInCalendarDays(fieldValueAsDate, today) > valueAsNumber;
                  case "before":
                      return differenceInCalendarDays(fieldValueAsDate, today) < -valueAsNumber;
                  case "sameDay":
                      return differenceInCalendarDays(fieldValueAsDate, today) === 0;
                  // Add more cases if there are other date-based operators
              }
          }
          // Handling non-date values or if the date check does not pass
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
