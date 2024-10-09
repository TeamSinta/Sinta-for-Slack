// @ts-nocheck

import { convertHtmlToSlackMrkdwn, formatListToString, formatToReadableDate } from "@/lib/utils";

// Function to replace tokens with real examples
export const replaceTokensWithExamples = (format: string): string => {
  return format
    .replace("{{CANDIDATE_NAME}}", "John Doe")
    .replace("{{CANDIDATE_LAST_NAME}}", "Doe")
    .replace("{{CANDIDATE_FIRST_NAME}}", "John")
    .replace("{{CANDIDATE_CREATION_MONTH_TEXT}}", "March")
    .replace("{{CANDIDATE_CREATION_MONTH_NUMBER}}", "03")
    .replace("{{CANDIDATE_CREATION_MONTH_TEXT_ABBREVIATED}}", "Mar")
    .replace("{{CANDIDATE_CREATION_DAY_NUMBER}}", "11")
    .replace("{{CANDIDATE_CREATION_DATE}}", "2023-03-14")
    .replace("{{JOB_NAME}}", "Software Engineer")
    .replace("{{JOB_POST_DATE}}", "2023-03-14")
    .replace("{{JOB_POST_MONTH_TEXT}}", "March")
    .replace("{{JOB_POST_MONTH_NUMBER}}", "03")
    .replace("{{JOB_POST_MONTH_TEXT_ABBREVIATED}}", "Mar")
    .replace("{{JOB_POST_DAY_NUMBER}}", "11");
};

// Function to format the final Slack channel name without invalid characters for Slack
export const formatSlackChannelName = (name: string): string => {
  return name
    .replace(/\s+/g, "") // Remove spaces
    .replace(/[^a-zA-Z0-9-_]/g, ""); // Remove invalid characters
};


export function parseCustomMessageBody(
  customMessageBody: any,
  candidateDetails: Record<string, unknown>,
  interviewDetails?: Record<string, unknown> | undefined,
) {
  // Replace the placeholders with corresponding candidate details safely
  let formattedMessage = customMessageBody;

  // Safely handle undefined candidate details using optional chaining (?.) and provide default values
  formattedMessage = formattedMessage.replace(
      /{{Candidate_Name}}/g,
      `{{first_name}} {{last_name}}`,
  );
  formattedMessage = formattedMessage.replace(
      /{{first_name}}/g,
      candidateDetails?.first_name || "N/A",
  );
  formattedMessage = formattedMessage.replace(
      /{{last_name}}/g,
      candidateDetails?.last_name || "N/A",
  );
  formattedMessage = formattedMessage.replace(
      /{{role_name}}/g,
      candidateDetails?.title || "N/A",
  );
  formattedMessage = formattedMessage.replace(
      /{{company}}/g,
      candidateDetails?.company || "N/A",
  );
  formattedMessage = formattedMessage.replace(
      /{{recruiter_name}}/g,
      candidateDetails?.recruiter?.name || "N/A",
  );
  formattedMessage = formattedMessage.replace(
      /{{coordinator_name}}/g,
      candidateDetails?.coordinator?.name || "N/A",
  );
  formattedMessage = formattedMessage.replace(
      /{{Job Stage}}/g,
      candidateDetails?.applications?.[0]?.current_stage?.name || "N/A",
  );
  formattedMessage = formattedMessage.replace(
      /{{Interviewer Names}}/g,
      formatListToString(
          interviewDetails?.interviewers?.map(
              (interviewer) => interviewer.name,
          ),
      ) || "N/A",
  );
  formattedMessage = formattedMessage.replace(
      /{{Interview Location}}/g,
      interviewDetails?.location || "N/A",
  );
  formattedMessage = formattedMessage.replace(
      /{{Interview Start Time}}/g,
      formatToReadableDate(interviewDetails?.start?.date_time) || "N/A",
  );
  formattedMessage = formattedMessage.replace(
      /{{Interview End Time}}/g,
      formatToReadableDate(interviewDetails?.end?.date_time) || "N/A",
  );
  formattedMessage = formattedMessage.replace(
      /{{Scorecard ids}}/g,
      interviewDetails?.interviewers
          ?.map((interviewer) => interviewer?.scorecard_id)
          .filter((item) => item)
          .join(" | ") || "N/A",
  );
  formattedMessage = formattedMessage.replace(
      /{{Interview Title}}/g,
      interviewDetails?.interview?.name || "N/A",
  );
  formattedMessage = formattedMessage.replace(
      /{{Video Conference URL}}/g,
      interviewDetails?.video_conferencing_url || "N/A",
  );

  // Convert the HTML content to Slack markdown format
  const slackFormattedMessage = convertHtmlToSlackMrkdwn(formattedMessage);

  // Return the final Slack-compatible message
  return slackFormattedMessage;
}
