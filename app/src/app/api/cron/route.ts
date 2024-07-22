/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { getEmailsfromSlack } from "@/server/slack/core";
import { fetchGreenhouseUsers } from "@/server/greenhouse/core";
import { NextResponse } from "next/server";
import { getWorkflows } from "@/server/actions/workflows/queries";
import {
    filterDataWithConditions,
    filterStuckinStageDataConditions,
} from "@/server/greenhouse/core";
import { filterProcessedForSlack, matchUsers } from "@/lib/slack";
import {
    sendSlackButtonNotification,
    sendSlackNotification,
} from "@/server/slack/core";
import { customFetch } from "@/utils/fetch";
import { getSlackTeamIDByWorkflowID } from "@/server/actions/slack/query";
import { getSubdomainByWorkflowID } from "@/server/actions/organization/queries";

import { inviteUsersToChannel } from '@/server/actions/assignments/mutations'


// naming change? why mutation??
// async function handleHiringRoom(hiring_room){
//     const channelName = "gobucks";
//     const userEmails = ["gobucks@yahoo.com","giannis@gmail.com"];
//     await createSlackChannel(channelName, userEmails)

// }
// Define the GET handler for the route
// async function getAllJobs(){
//     //https://harvest.greenhouse.io/v1/candidates
//     const jobOpeningsUrl = 'https://harvest.greenhouse.io/v1/jobs'
//     const data = await customFetch(jobOpeningsUrl); // Fetch data using custom fetch wrapper

// }
async function getAllCandidates() {
    //https://harvest.greenhouse.io/v1/candidates
    const candidateUrl = "https://harvest.greenhouse.io/v1/candidates";
    const data = await customFetch(candidateUrl); // Fetch data using custom fetch wrapper
}
function getSlackUserIds(hiringroom, candidates, userMapping) {
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
    console.log(
        "hiring reciepieints  -",
        hiring_room_recipient.reciepients.length,
    );
    hiring_room_recipient.recipients.forEach((recipient) => {
        if (recipient.source == "greenhouse") {
            if (recipient.value.includes("ecruiter")) {
                if (candidate.recruiter) {
                    const slackId = userMapping[candidate.recruiter.id];
                    if (slackId) {
                        console.log("entered map");
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
function getSlackUsersFromRecipient(hiringroomRecipient) {
    const slackUsers = [];
    console.log("hiring room recipient", hiringroomRecipient);
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
    console.log("slackUsers  - ", slackUsers);

    return slackUsers;
}
function generateRandomSixDigitNumber() {
    const min = 100000; // Minimum 6-digit number
    const max = 999999; // Maximum 6-digit number
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomNumber.toString(); // Convert to string
}
function buildGreenHouseUsersForCandidate(hiring_room_recipient, cand_id, job_id){
    hiring_room_recipient.forEach((recipient)=>{
        if(recipient.source == "greenhouse"){

        }
    });
}

function buildSlackChannelNameForJob(slackChannelFormat: string, job: any): string {

   try{
        let channelName = slackChannelFormat
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
    console.log("candidate  -", candidate);
    console.log("candidate created at -", candidate.created_at);

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
export async function saveSlackChannelCreatedToDB(
    slackChannelId,
    invitedUsers,
    channelName,
    hiringroomId,
    slackChannelFormat,
) {
    try {
        console.log("hiringroomId - ", hiringroomId);
        await db.insert(slackChannelsCreated).values({
            name: channelName,
            channelId: slackChannelId,
            // createdBy: 'user_id', // Replace with actual user ID
            // description: 'Channel description', // Optional
            isArchived: false,
            invitedUsers: invitedUsers,
            hiringroomId: hiringroomId, // Replace with actual hiring room ID
            channelFormat: slackChannelFormat, // Example format
            createdAt: new Date(),
            modifiedAt: new Date(), // Ensure this field is included
        });
    } catch (e) {
        throw new Error(`Error saving slack chanenl created: ${e}`);
    }
    return "success";
}
export async function handleIndividualHiringroom(hiringroom) {
    const hiringroomId = hiringroom.id;
    console.log("indivi room - ", hiringroomId);
    // return
    const allJobs = await fetchJobsFromGreenhouse();
    console.log("indivi room1");
    const allCandidates = await fetchCandidates();
    console.log("indivi room2");
    const greenhouseUsers = await fetchGreenhouseUsers();
    console.log("hiring room3 - past green house");
    const slackTeamID = await getSlackTeamIDByHiringroomID(hiringroomId);
    console.log("indivi room4");

    const slackUsers = await getEmailsfromSlack(slackTeamID);
    const userMapping = await matchUsers(greenhouseUsers, slackUsers);
    // create job room - name job_title + date posted + time
    // create candidate room - name candidate_first_initial + candidate_last_name + job_title
    console.log("5pre check object field - slack team id - ", slackTeamID);
    if (hiringroom.objectField == "Candidates") {
        // hiringroom.recipient = buildHiringRoomRecipients()
        // const slackUserIds = getSlackUserIds()
        console.log("all candidates ? -", allCandidates.length);
        allCandidates.forEach(async (candidate) => {
            const candidateFitsConditions = true; //check()
            if (candidateFitsConditions) {
                console.log("new cand");

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
                console.log("past 1");
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
                    console.log("hiringroomId - ", hiringroomId);
                    await saveSlackChannelCreatedToDB(
                        channelId,
                        slackUserIds,
                        channelName,
                        hiringroomId,
                        hiringroom.slackChannelFormat,
                    );
                                      await saveSlackChannelCreatedToDB(channelId, slackUserIds, channelName, hiringroomId, hiringroom.slackChannelFormat, candidate.id, candidate.applications[0].jobs[0].id)

                }
            }
        });
    } else if (hiringroom.objectField == "Jobs") {
        console.log("go bucks hiring job");
        // console.log('hiring room -',hiringroom," ------- hiring room")
        console.log("all allJobs ? -", allJobs.length);

        allJobs.forEach(async (job) => {
            const jobFitsConditions = true;

            // const jobFitsConditions = check()
            if (jobFitsConditions) {
                // create slack channel
                // let channelName = sanitizeChannelName(job.id + "-"+"1")
                // let channelName = sanitizeChannelName(job.id + "-"+"1")
                console.log("pre build");
                const channelName = buildSlackChannelNameForJob(
                    hiringroom.slackChannelFormat,
                    job,
                );
                // channelName=channelName.substring(0,channelName.length-2)
                // channelName = channelName.substring(0,6)
                // channelName = channelName.substring(0,6)
                // generateRandomSixDigitNumber
                // const channelName = generateRandomSixDigitNumber()
                const slackUsersIds = getSlackUsersFromRecipient(
                    hiringroom.recipient,
                );
                // const slackIdsOfGreenHouseUsers = getSlackIdsOfGreenHouseUsers(hiringroom.recipient, candidate, userMapping)
                const slackUserIds = slackUsersIds; // + slackIdsOfGreenHouseUsers
                // const slackUserIds = slackUsersIds + slackIdsOfGreenHouseUsers
                console.log("create slack channel - ", slackTeamID);
                console.log("create slack channelName - ", channelName);

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
                    // const messageText = 'Welcome to the new hiring room!';
                    // await postMessageToSlackChannel(channelId, messageText);
                    console.log("hiringroomId - ", hiringroomId);
                    await saveSlackChannelCreatedToDB(channelId, slackUserIds, channelName, hiringroomId, hiringroom.slackChannelFormat,"",job.id)

                }
            }
        });
    }
    return hiringroom;
}

export async function handleHiringrooms(){
    const hiringrooms: HiringRoom[] = await getHiringrooms()
    const hiringroomsLength = hiringrooms.length
    if(hiringrooms.length > 0){
        for (const hiringroom of hiringrooms) {
            await handleIndividualHiringroom(hiringroom);
        }
    }
    return hiringroomsLength
}
function sanitizeChannelName(name) {
    return name
        .toLowerCase() // convert to lowercase
        .replace(/[^a-z0-9-_]/g, "-") // replace invalid characters with hyphens
        .slice(0, 79); // ensure the name is less than 80 characters
}

function combineGreenhouseRolesAndSlackUsers(workflowRecipient) {
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
        const workflowsLength = workflows.length

        let shouldReturnNull = false; // Flag to determine whether to return null

        for (const workflow of workflows) {
            if (workflow.alertType === "time-based") {
                const { apiUrl } = workflow.triggerConfig;
                const data = await customFetch(apiUrl); // Fetch data using custom fetch wrapper

                const filteredConditionsData = filterDataWithConditions(
                    data,
                    workflow.conditions,
                );

                if (filteredConditionsData.length === 0) {
                    shouldReturnNull = true; // Set flag to true
                } else {
                    const filteredSlackData = filterProcessedForSlack(
                        filteredConditionsData,
                        workflow.recipient,
                    );
                    await sendSlackNotification(
                        filteredSlackData,
                        workflow.recipient,
                    );
                }
            } else if (workflow.alertType === "stuck-in-stage") {
                const { apiUrl, processor } = workflow.triggerConfig;
                const data = await customFetch(
                    apiUrl,
                    processor ? { query: processor } : {},
                );
                // console.log("cron-job running!! - data ",data);
                // Filter data based on the "stuck-in-stage" conditions
                const filteredConditionsData =
                    await filterStuckinStageDataConditions(
                        data,
                        workflow.conditions,
                    );
                const slackTeamID = await getSlackTeamIDByWorkflowID(
                    workflow.id,
                );
                const subDomain = await getSubdomainByWorkflowID(workflow.id);

                const greenhouseUsers = await fetchGreenhouseUsers();
                const slackUsers = await getEmailsfromSlack(slackTeamID);
                const userMapping = await matchUsers(
                    greenhouseUsers,
                    slackUsers,
                );
                // const matchGreenhouseUsers = matc
                // console.log("filteredConditionsData", filteredConditionsData);
                const filteredSlackData = await filterProcessedForSlack(
                    filteredConditionsData,
                    workflow.recipient,
                    slackTeamID,
                    greenhouseUsers,
                    slackUsers,
                    userMapping,
                );

                if (filteredSlackData.length > 0) {
                    await sendSlackButtonNotification(
                        filteredSlackData,
                        workflow.recipient,
                        slackTeamID,
                        subDomain,
                        userMapping,
                        filteredConditionsData,
                    );
                } else {
                    console.log("No data to send to Slack");
                }
            } else if (workflow.alertType === "create-update") {
                // Logic for "create-update" conditions
            }
            console.log("hereererere");
        }

        if (shouldReturnNull) {
            return NextResponse.json(
                { message: "No workflows to process" },
                { status: 200 },
            );
        }

        return NextResponse.json(
            { message: "Workflows processed successfully" },
            { status: 200 },
        );
    } catch (error: unknown) {
        console.error("Failed to process workflows:", error);
        return NextResponse.json(
            {
                error: "Failed to process workflows",
                details: (error as Error).message,
            },
            { status: 500 },
        );
    }
}
// Define the GET handler for the route
export async function GET() {
    try{
        const numWorkflows = await handleWorkflows()
        const numHiringrooms = await handleHiringrooms()
        return NextResponse.json({ message: `Workflows processed successfully - workflows - ${numWorkflows} - hiringrooms - ${numHiringrooms}` }, { status: 200 });
    }
    catch(e){
        console.log('eeee - ', e)
        return NextResponse.json({ message: "No workflows to process" }, { status: 200 });
    }
}
// create slack channel via slack and save in db we created it
async function createSlackChannel(channelName, slackTeamId) {
    console.log("createSlackChannel - pre access token - ", slackTeamId);
    const accessToken = await getAccessToken(slackTeamId);

    try {
        const response = await fetch(
            "https://slack.com/api/conversations.create",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    name: channelName,
                }),
            },
        );
        console.log("Name taken - ", channelName);

        const data = await response.json();
        if (!data.ok) {
            if (data.error == "name_taken") {
                console.log("Name taken - ", channelName);
                // throw new Error(`Error creating channel: ${data.error}`);
            }
            throw new Error(`Error creating channel: ${data.error}`);
        }

        console.log("Channel created successfully:");
        // console.log('Channel created successfully:', data);
        return data.channel.id; // Return the channel ID for further use
    } catch (error) {
        console.error(
            "Error - createSlackChannel - creating Slack channel:",
            error,
        );
    }
}

async function inviteUsersToChannel(channelId, userIds, slackTeamId) {
    try {
        console.log("userids - ", userIds);
        console.log("inviteuserstochannel - pre access token");

        const accessToken = await getAccessToken(slackTeamId);
        const response = await fetch(
            "https://slack.com/api/conversations.invite",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    channel: channelId,
                    users: userIds.join(","),
                }),
            },
        );

        const data = await response.json();
        if (!data.ok) {
            throw new Error(`Error inviting users: ${data.error}`);
        }

        console.log("Users invited successfully:", data);
    } catch (error) {
        console.error("Error inviting users to Slack channel:", error);
    }
}
