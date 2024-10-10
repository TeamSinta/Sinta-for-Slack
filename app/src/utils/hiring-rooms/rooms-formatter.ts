import { format, parseISO } from "date-fns";

export function buildSlackChannelNameForJob(
    slackChannelFormat: string,
    job: any,
): string {
    try {
        let channelName = slackChannelFormat;

        // Parse the created_at date for the job
        const jobCreatedAt = parseISO(job.created_at);
        const jobMonthText = format(jobCreatedAt, "MMMM"); // Full month name
        const jobMonthNumber = format(jobCreatedAt, "MM"); // Month number
        const jobMonthTextAbbreviated = format(jobCreatedAt, "MMM"); // Abbreviated month name
        const jobDayNumber = format(jobCreatedAt, "dd"); // Day number

        // Replace each token with the corresponding value from the job data
        channelName = channelName
            .replaceAll("{{JOB_NAME}}", job.name)
            .replaceAll("{{JOB_POST_DATE}}", job.created_at.split("T")[0]) // Extracting the date part
            .replaceAll("{{JOB_POST_MONTH_TEXT}}", jobMonthText)
            .replaceAll("{{JOB_POST_MONTH_NUMBER}}", jobMonthNumber)
            .replaceAll(
                "{{JOB_POST_MONTH_TEXT_ABBREVIATED}}",
                jobMonthTextAbbreviated,
            )
            .replaceAll("{{JOB_POST_DAY_NUMBER}}", jobDayNumber);

        // Use custom logic to handle additional custom user tokens
        channelName = handleCustomTokens(channelName);

        // Sanitize the final channel name by removing invalid characters and spaces
        channelName = sanitizeChannelName(channelName);

        return channelName;
    } catch (e) {
        console.log("Error in buildSlackChannelNameForJob: ", e);
        throw new Error(`Error building Slack channel name: ${e}`);
    }
}

// Function to handle custom tokens added by the user
function handleCustomTokens(channelName: string): string {
    return channelName.replace(/{{.*?}}/g, ""); // Removing user-defined tokens
}

// Function to sanitize the Slack channel name
export function sanitizeChannelName(name: string) {
    return name
        .toLowerCase() // Convert to lowercase
        .replace(/[^a-z0-9-_]/g, "-") // Replace invalid characters with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with a single hyphen
        .replace(/^-|-$/g, "") // Remove leading or trailing hyphens
        .slice(0, 79); // Ensure the name is less than 80 characters
}

export function getSlackUsersFromRecipient(recipientObject: {
    recipients: any[];
}) {
    const slackUsers: any[] = [];

    // Check if recipients is defined and is an array
    if (
        !recipientObject.recipients ||
        !Array.isArray(recipientObject.recipients)
    ) {
        console.error(
            "Recipients is not an array or is undefined:",
            recipientObject.recipients,
        );
        return slackUsers; // Return an empty array if recipients is not valid
    }

    // Iterate over the nested recipients array
    recipientObject.recipients.forEach((recipient) => {
        if (recipient.source === "slack") {
            if (
                recipient.value &&
                recipient.label && // Ensure recipient.label exists
                recipient.label.startsWith("@") &&
                !recipient.label.startsWith("#")
            ) {
                slackUsers.push(recipient.value);
            } else {
                console.log("Invalid Slack recipient: ", recipient.value);
            }
        }
    });

    return slackUsers;
}
