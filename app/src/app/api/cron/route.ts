/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

export const dynamic = "force-dynamic";

import {
    createSlackChannel,
    getEmailsfromSlack,
    inviteUsersToChannel,
    sendAndPinSlackMessage,
} from "@/server/slack/core";
import {
    fetchGreenhouseUsers,
    fetchJobsFromGreenhouse,
    fetchCandidates,
} from "@/server/greenhouse/core";
import { NextResponse } from "next/server";
import { getWorkflows } from "@/server/actions/workflows/queries";
import { filterDataWithConditions } from "@/server/greenhouse/core";
import { formatOpeningMessageSlack, matchUsers } from "@/lib/slack";
import { customFetch } from "@/utils/fetch";
import { getSlackTeamIDByHiringroomID } from "@/server/actions/slack/query";
import {
    processCandidates,
    processScheduledInterviews,
} from "@/server/objectworkflows/queries";
import { type WorkflowData } from "@/app/(app)/(user)/workflows/_components/columns";
import { addGreenhouseSlackValue } from "@/lib/slack";
import { getHiringrooms } from "@/server/actions/hiringrooms/queries";

import { format, formatISO, parseISO } from "date-fns";
import { processInterviewReminders } from "./interviewReminders";
import { saveSlackChannelCreatedToDB } from "@/server/actions/slackchannels/mutations";

async function getAllCandidates() {
    //https://harvest.greenhouse.io/v1/candidates
    const candidateUrl = "https://harvest.greenhouse.io/v1/candidates";
    const data = await customFetch(candidateUrl); // Fetch data using custom fetch wrapper
}

function getSlackUserIds(
    hiringroom: { recipient: any[] },
    candidates: any,
    userMapping: any,
) {
    // function buildHiringRoomRecipients(hiringroom, candidates, userMapping){
    hiringroom.recipient.map((recipient: any) => {
        if (recipient.source === "greenhouse") {
            return addGreenhouseSlackValue(recipient, candidates, userMapping);
        }
        return recipient;
    });
    const greenHouseAndSlackRecipients =
        combineGreenhouseRolesAndSlackUsers(hiringroom);
    return greenHouseAndSlackRecipients;
}
function getSlackIdsOfGreenHouseUsers(
    hiring_room_recipient,
    candidate,
    userMapping,
) {
    const slackIds = [];

    hiring_room_recipient.recipients.forEach((recipient) => {
        if (recipient.source == "greenhouse") {
            if (recipient.value.includes("ecruiter")) {
                if (candidate.recruiter) {
                    const slackId = userMapping[candidate.recruiter.id];
                    if (slackId) {
                        slackIds.push(slackId); //recipient.slackValue = slackId;
                    }
                }
            } else if (recipient.value.includes("oordinator")) {
                if (candidate.coordinator) {
                    const slackId = userMapping[candidate.coordinator.id];
                    if (slackId) {
                        slackIds.push(slackId); //recipient.slackValue = slackId;
                    }
                }
            }
        }
    });
    return slackIds;
}
function getSlackUsersFromRecipient(hiringroomRecipient: {
    recipients: any[];
}) {
    const slackUsers = [];
    hiringroomRecipient.recipients.forEach((recipient) => {
        if (recipient.source == "slack") {
            if (
                recipient.value &&
                recipient.label.startsWith("@") &&
                !recipient.label.startsWith("#")
            ) {
                slackUsers.push(recipient.value);
            } else {
                console.log(
                    "bad news - bad recipient - selected slack channel - recipient.value-",
                    recipient.value,
                );
            }
        }
    });

    return slackUsers;
}

function generateRandomSixDigitNumber() {
    const min = 100000; // Minimum 6-digit number
    const max = 999999; // Maximum 6-digit number
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomNumber.toString(); // Convert to string
}

function buildSlackChannelNameForJob(
    slackChannelFormat: string,
    job: any,
): string {
    try {
        let channelName = slackChannelFormat;

        // Parse the created_at date for job
        const jobCreatedAt = parseISO(job.created_at);
        const jobMonthText = format(jobCreatedAt, "MMMM"); // Full month name
        const jobMonthNumber = format(jobCreatedAt, "MM"); // Month number
        const jobMonthTextAbbreviated = format(jobCreatedAt, "MMM"); // Abbreviated month name
        const jobDayNumber = format(jobCreatedAt, "dd"); // Day number
        // Replace each placeholder with the corresponding value
        channelName = channelName
            .replaceAll("{{JOB_NAME}}", job.name)
            .replaceAll("{{JOB_POST_DATE}}", jobMonthText)
            .replaceAll("{{JOB_POST_MONTH_TEXT}}", jobMonthText)
            .replaceAll("{{JOB_POST_MONTH_NUMBER}}", jobMonthNumber)
            .replaceAll(
                "{{JOB_POST_MONTH_TEXT_ABBREVIATED}}",
                jobMonthTextAbbreviated,
            )
            .replaceAll("{{JOB_POST_DAY_NUMBER}}", jobDayNumber);
        channelName = sanitizeChannelName(channelName);
        return channelName;
    } catch (e) {
        console.log("errror in build salck channel - ", e);
        const randomNumString = generateRandomSixDigitNumber();
        throw new Error(
            `Error saving ASKJFALSFJAS;KFGHJASFGKDslack chanenl created: ${e}`,
        );
        return "goooooooo-bucks-" + randomNumString;
    }
}
function buildSlackChannelNameForCandidate(
    slackChannelFormat: string,
    candidate: any,
): string {
    let channelName = slackChannelFormat;

    // Parse the created_at date for candidate
    const candidateCreatedAt = parseISO(candidate.created_at);
    const candidateMonthText = format(candidateCreatedAt, "MMMM"); // Full month name
    const candidateMonthNumber = format(candidateCreatedAt, "MM"); // Month number
    const candidateMonthTextAbbreviated = format(candidateCreatedAt, "MMM"); // Abbreviated month name
    const candidateDayNumber = format(candidateCreatedAt, "dd"); // Day number

    // Replace each placeholder with the corresponding value
    channelName = channelName
        .replaceAll(
            "{{CANDIDATE_NAME}}",
            candidate.first_name + " " + candidate.last_name,
        )
        .replaceAll("{{CANDIDATE_FIRST_NAME}}", candidate.first_name)
        .replaceAll("{{CANDIDATE_LAST_NAME}}", candidate.last_name)
        .replaceAll("{{CANDIDATE_CREATION_MONTH_TEXT}}", candidateMonthText)
        .replaceAll("{{CANDIDATE_CREATION_MONTH_NUMBER}}", candidateMonthNumber)
        .replaceAll(
            "{{CANDIDATE_CREATION_MONTH_TEXT_ABBREVIATED}}",
            candidateMonthTextAbbreviated,
        )
        .replaceAll("{{CANDIDATE_CREATION_DAY_NUMBER}}", candidateDayNumber)
        .replaceAll("{{CANDIDATE_CREATION_DATE}}", candidateDayNumber);
    candidate_creation_month_text_abbreviated;
    channelName = sanitizeChannelName(channelName);
    return channelName;
}

export async function handleIndividualHiringroom(hiringroom: {
    id: any;
    objectField: string;
    slackChannelFormat: string;
    recipient: { recipients: any[] };
}) {
    const hiringroomId = hiringroom.id;
    const allJobs = await fetchJobsFromGreenhouse();
    const allCandidates = await fetchCandidates();
    const greenhouseUsers = await fetchGreenhouseUsers();
    const slackTeamID = await getSlackTeamIDByHiringroomID(hiringroomId);
    const slackUsers = await getEmailsfromSlack(slackTeamID);
    const userMapping = await matchUsers(greenhouseUsers, slackUsers);

    if (hiringroom.objectField == "Candidates") {
        allCandidates.forEach(async (candidate) => {
            const candidateFitsConditions = true; //check()
            if (candidateFitsConditions) {
                // create slack channel
                const channelName = buildSlackChannelNameForCandidate(
                    hiringroom.slackChannelFormat,
                    candidate,
                );
                // const channelName = sanitizeChannelName(hiringroom.slackChannelFormat)
                // const channelName = sanitizeChannelName(candidate.id + "-" + candidate.name)
                const slackUsersIds = getSlackUsersFromRecipient(
                    hiringroom.recipient,
                );
                const slackIdsOfGreenHouseUsers = getSlackIdsOfGreenHouseUsers(
                    hiringroom.recipient,
                    candidate,
                    userMapping,
                );
                const slackUserIds = slackUsersIds.concat(
                    slackIdsOfGreenHouseUsers,
                );
                const messageText = "really good message text";
                const channelId = await createSlackChannel(
                    channelName,
                    slackTeamID,
                );
                // does this mean successfully create NOW, not previously created?
                if (channelId) {
                    const invitedUsers = await inviteUsersToChannel(
                        channelId,
                        slackUserIds,
                        slackTeamID,
                    );
                    const messageText = "Welcome to the new hiring room!";
                    // await postMessageToSlackChannel(channelId, messageText, slackTeamID);
                    await saveSlackChannelCreatedToDB(
                        channelId,
                        slackUserIds,
                        channelName,
                        hiringroomId,
                        hiringroom.slackChannelFormat,
                        candidate.id,
                        candidate.applications[0].jobs[0].id,
                    );
                }
            }
        });
    } else if (hiringroom.objectField == "Jobs") {
        allJobs.forEach(async (job) => {
            const jobFitsConditions = true;
            // const jobFitsConditions = check()
            if (jobFitsConditions) {
                const channelName = buildSlackChannelNameForJob(
                    hiringroom.slackChannelFormat,
                    job,
                );

                const slackUsersIds = getSlackUsersFromRecipient(
                    hiringroom.recipient,
                );
                const slackUserIds = slackUsersIds; // + slackIdsOfGreenHouseUsers
                const channelId = await createSlackChannel(
                    channelName,
                    slackTeamID,
                );

                // does this mean successfully create NOW, not previously created?
                if (channelId) {
                    await inviteUsersToChannel(
                        channelId,
                        slackUserIds,
                        slackTeamID,
                    );
                    const { messageBlocks } = await formatOpeningMessageSlack(
                        hiringroom,
                        slackTeamID,
                    );
                    await sendAndPinSlackMessage(
                        channelId,
                        slackTeamID,
                        messageBlocks,
                    );

                    const messageText = "Welcome to the new hiring room!";

                    await saveSlackChannelCreatedToDB(
                        channelId,
                        slackUserIds,
                        channelName,
                        hiringroomId,
                        hiringroom.slackChannelFormat,
                        hiringroom.slackChannelFormat,
                    );
                }
            }
        });
    }
    return hiringroom;
}

export async function handleHiringrooms() {
    const hiringrooms: HiringRoom[] = await getHiringrooms();
    const hiringroomsLength = hiringrooms.length;
    if (hiringrooms.length > 0) {
        for (const hiringroom of hiringrooms) {
            await handleIndividualHiringroom(hiringroom);
        }
    }
    return hiringroomsLength;
}
function sanitizeChannelName(name: string) {
    return name
        .toLowerCase() // convert to lowercase
        .replace(/[^a-z0-9-_]/g, "-") // replace invalid characters with hyphens
        .slice(0, 79); // ensure the name is less than 80 characters
}

export function combineGreenhouseRolesAndSlackUsers(workflowRecipient: {
    recipient?: any[];
    recipients?: any;
}) {
    const greenhouseRecipients = [];
    let hasGreenhouse = false;
    const greenhouseRoles = [];
    workflowRecipient.recipients.map((rec) => {
        if (rec.source == "greenhouse") {
            hasGreenhouse = true;
            greenhouseRoles.push(rec.value);
        }
    });

    if (hasGreenhouse) {
        const candidates = filteredConditionsData;
        // console.log('filteredConditionsData - ',filteredConditionsData)
        console.log("candidates - ", candidates.length);
        candidates.forEach((cand) => {
            console.log("greenhouseRoles - ", greenhouseRoles.length);

            greenhouseRoles.forEach((role) => {
                if (role.includes("ecruiter") || role.includes("oordinator")) {
                    if (userMapping[cand.recruiter.id]) {
                        const newRecipient = {
                            value: userMapping[cand.recruiter.id],
                        };
                        greenhouseRecipients.push(newRecipient);
                    } else if (userMapping[cand.coordinator.id]) {
                        const newRecipient = {
                            value: userMapping[cand.coordinator.id],
                        };
                        greenhouseRecipients.push(newRecipient);
                    }
                }
            });
        });
    }
    const allRecipients =
        workflowRecipient.recipients.concat(greenhouseRecipients);
    return allRecipients;
}

export async function handleWorkflows() {
    try {
        const workflows: WorkflowData[] =
            (await getWorkflows()) as WorkflowData[]; // Retrieve workflows from the database
        // console.log('workflows length - ',workflows.length)
        const workflowsLength = workflows.length;

        let shouldReturnNull = false; // Flag to determine whether to return null

        const now = new Date();
        const workflowDataQueryParams = {
            Interviews: { starts_after: formatISO(now), per_page: 500 }, // We only want to see upcoming interviews
        };
        for (const workflow of workflows) {
            if (workflow.alertType === "timebased") {
                // Add query params to the apiUrl
                const { apiUrl }: { apiUrl?: string } =
                    workflow.triggerConfig as { apiUrl?: string };
                const searchParams = new URLSearchParams();
                for (const [key, value] of Object.entries(
                    workflowDataQueryParams[workflow.objectField] ?? {},
                )) {
                    searchParams.append(key, value as string);
                }
                const urlWithParams = searchParams.toString()
                    ? `${apiUrl}?${searchParams.toString()}`
                    : apiUrl;
                const data = await customFetch(urlWithParams ?? ""); // Fetch data using custom fetch wrapper
                let filteredConditionsData;

                switch (workflow.objectField) {
                    case "Scheduled Interviews":
                        filteredConditionsData =
                            await processScheduledInterviews(data, workflow);
                        break;
                    case "Candidates":
                        filteredConditionsData = await processCandidates(
                            data,
                            workflow,
                        );
                        break;
                    case "Interviews":
                        filteredConditionsData =
                            await processInterviewReminders(data, workflow);
                    default:
                        filteredConditionsData = filterDataWithConditions(
                            data,
                            workflow.conditions,
                        );
                        break;
                }
                if (filteredConditionsData?.length === 0) {
                    shouldReturnNull = true; // Set flag to true
                } else {
                    console.log("No conditions running");
                }
            } else if (workflow.alertType === "create-update") {
                // Logic for "create-update" conditions
            }
        }

        if (shouldReturnNull) {
            return false;
        }
        return workflowsLength;
    } catch (error: unknown) {
        console.error("Failed to process workflows:", error);
        return false;
    }
}
// Define the GET handler for the route
export async function GET() {
    try {
        console.log("gobucks");

        // Ensure numWorkflows is defined or set a default value if necessary
        let numWorkflows = 0;
        let numHiringrooms = 0;
        // numWorkflows = await handleWorkflows();
        // numHiringrooms = await handleHiringrooms();
        return NextResponse.json(
            {
                message: `Workflows processed successfully - workflows - ${numWorkflows} - hiringrooms - ${numHiringrooms}`,
            },
            { status: 200 },
        );
    } catch (e) {
        console.log("eeee - ", e);
        return NextResponse.json(
            { message: "No workflows to process" },
            { status: 200 },
        );
    }
}
