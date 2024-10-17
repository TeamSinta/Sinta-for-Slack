import { format, parseISO } from "date-fns";

export function buildSlackChannelNameForJob(
    slackChannelFormat: string,
    job: any,
): string {
    return buildSlackChannelName(slackChannelFormat, job, "job");
}

export function buildSlackChannelName(
    slackChannelFormat: string,
    entity: any,
    entityType: "candidate" | "job",
): string {
    if (!slackChannelFormat) {
        throw new Error(`Invalid input for slackChannelFormat`);
    }

    try {
        const channelName = replaceEntityTokens(
            slackChannelFormat,
            entity,
            entityType,
        );
        const sanitizedChannelName = sanitizeChannelName(channelName);
        return sanitizedChannelName;
    } catch (e: any) {
        console.error(`Error in buildSlackChannelName for ${entityType}:`, e);
        throw new Error(
            `Error building Slack channel name for ${entityType}: ${e.message}`,
        );
    }
}

function replaceEntityTokens(
    slackChannelFormat: string,
    entity: any,
    entityType: "candidate" | "job",
): string {
    let formatTokens: Record<string, string> = {};

    if (entityType === "candidate") {
        const entityCreatedAt = parseISO(entity?.candidate?.created_at);
        const candidateFirstName = entity?.candidate?.first_name ?? "";
        const candidateLastName = entity?.candidate?.last_name ?? "";
        const candidateName = candidateFirstName + " " + candidateLastName;

        formatTokens = {
            "{{CANDIDATE_NAME}}": candidateName,
            "{{CANDIDATE_FIRST_NAME}}": candidateFirstName,
            "{{CANDIDATE_LAST_NAME}}": candidateLastName,
            "{{CANDIDATE_CREATION_DATE}}":
                entity?.candidate?.created_at?.split("T")[0] ?? "N/A",
            "{{CANDIDATE_POST_MONTH_TEXT}}": format(entityCreatedAt, "MMMM"),
            "{{CANDIDATE_POST_MONTH_NUMBER}}": format(entityCreatedAt, "MM"),
            "{{CANDIDATE_POST_MONTH_TEXT_ABBREVIATED}}": format(
                entityCreatedAt,
                "MMM",
            ),
            "{{CANDIDATE_POST_DAY_NUMBER}}": format(entityCreatedAt, "dd"),
        };
    } else if (entityType === "job") {
        const entityCreatedAt = parseISO(entity?.created_at);
        formatTokens = {
            "{{JOB_NAME}}": entity.name,
            "{{JOB_POST_DATE}}": entity?.created_at.split("T")[0] ?? "N/A",
            "{{JOB_POST_MONTH_TEXT}}": format(entityCreatedAt, "MMMM"),
            "{{JOB_POST_MONTH_NUMBER}}": format(entityCreatedAt, "MM"),
            "{{JOB_POST_MONTH_TEXT_ABBREVIATED}}": format(
                entityCreatedAt,
                "MMM",
            ),
            "{{JOB_POST_DAY_NUMBER}}": format(entityCreatedAt, "dd"),
        };
    }

    // Replace tokens in channel format
    let channelName = slackChannelFormat;
    for (const [token, value] of Object.entries(formatTokens)) {
        channelName = channelName.replaceAll(token, value);
    }

    // Handle custom user-defined tokens
    return handleCustomTokens(channelName);
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
