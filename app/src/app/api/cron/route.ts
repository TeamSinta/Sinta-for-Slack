/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { getAccessToken
 } from "@/server/actions/slack/query";

import { getEmailsfromSlack } from "@/server/slack/core";
import { fetchGreenhouseUsers,filterScheduledInterviewsWithConditions, fetchJobsFromGreenhouse, fetchCandidates } from "@/server/greenhouse/core";
import { NextResponse } from "next/server";
import { getWorkflows } from "@/server/actions/workflows/queries";
import {
    filterDataWithConditions,
    filterStuckinStageDataConditions,
} from "@/server/greenhouse/core";
import { buildSlackMessageByCandidateOnFilteredData, matchUsers } from "@/lib/slack";
import {
    sendSlackButtonNotification,
    sendSlackNotification,
} from "@/server/slack/core";
import { customFetch } from "@/utils/fetch";
import { getSlackTeamIDByWorkflowID, getSlackTeamIDByHiringroomID } from "@/server/actions/slack/query";
import { getSubdomainByWorkflowID } from "@/server/actions/organization/queries";
import {addGreenhouseSlackValue} from '@/lib/slack'
import {getHiringrooms} from '@/server/actions/hiringrooms/queries'

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
async function getAllCandidates(){
    //https://harvest.greenhouse.io/v1/candidates
    const candidateUrl = 'https://harvest.greenhouse.io/v1/candidates'
    const data = await customFetch(candidateUrl); // Fetch data using custom fetch wrapper

}
function getSlackUserIds(hiringroom, candidates, userMapping){
    // function buildHiringRoomRecipients(hiringroom, candidates, userMapping){
    hiringroom.recipient.map((recipient: any) => {
        if (recipient.source === "greenhouse") {
            return addGreenhouseSlackValue(recipient, candidates, userMapping);
        }
        return recipient;
    });
    const greenHouseAndSlackRecipients= combineGreenhouseRolesAndSlackUsers(hiringroom)
    return greenHouseAndSlackRecipients
}
function getSlackIdsOfGreenHouseUsers(hiring_room_recipient, candidate, userMapping){
    const slackIds = []
    hiring_room_recipient.recipients.forEach((recipient)=>{
        if(recipient.source == "greenhouse"){
            if(recipient.value.includes('ecruiter')){
                if (candidate.recruiter) {
                    const slackId = userMapping[candidate.recruiter.id];
                    if (slackId) {
                        console.log("entered map");
                        slackIds.push(slackId) //recipient.slackValue = slackId;
                    }
                }
            }
            else if(recipient.value.includes('oordinator')){
                if (candidate.coordinator) {
                    const slackId = userMapping[candidate.coordinator.id];
                    if (slackId) {
                        slackIds.push(slackId) //recipient.slackValue = slackId;
                    }
                }}
        }
    })
    return slackIds
}
function getSlackUsersFromRecipient(hiringroomRecipient){
    const slackUsers = []
    console.log('hiring room recipient',hiringroomRecipient)
    hiringroomRecipient.recipients.forEach((recipient)=>{
        if(recipient.source == "slack"){
            if(recipient.value && recipient.label.startsWith('@') && !recipient.label.startsWith('#')){
                slackUsers.push(recipient.value)
            }
            else{
                console.log('bad news - bad recipient - selected slack channel - recipient.value-',recipient.value)
            }
        }
    })
    console.log('slackUsers  - ',slackUsers)

    return slackUsers
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
    })
}
function getNamingConvention(hiringroom){

}
import { format, parseISO } from 'date-fns';

function buildSlackChannelName(slackChannelFormat: string, candidate: any, job: any): string {
    let channelName = slackChannelFormat;

    // Parse the created_at date for candidate
    const candidateCreatedAt = parseISO(candidate.created_at);
    const candidateMonthText = format(candidateCreatedAt, 'MMMM'); // Full month name
    const candidateMonthNumber = format(candidateCreatedAt, 'MM'); // Month number
    const candidateMonthTextAbbreviated = format(candidateCreatedAt, 'MMM'); // Abbreviated month name
    const candidateDayNumber = format(candidateCreatedAt, 'dd'); // Day number

    // Parse the created_at date for job
    const jobCreatedAt = parseISO(job.created_at);
    const jobMonthText = format(jobCreatedAt, 'MMMM'); // Full month name
    const jobMonthNumber = format(jobCreatedAt, 'MM'); // Month number
    const jobMonthTextAbbreviated = format(jobCreatedAt, 'MMM'); // Abbreviated month name
    const jobDayNumber = format(jobCreatedAt, 'dd'); // Day number

    // Replace each placeholder with the corresponding value
    channelName = channelName
        .replaceAll("{{CANDIDATE_NAME}}", candidate.name)
        .replaceAll("{{CANDIDATE_FIRST_NAME}}", candidate.first_name)
        .replaceAll("{{CANDIDATE_LAST_NAME}}", candidate.last_name)
        .replaceAll("{{CANDIDATE_MONTH_TEXT}}", candidateMonthText)
        .replaceAll("{{CANDIDATE_MONTH_NUMBER}}", candidateMonthNumber)
        .replaceAll("{{CANDIDATE_MONTH_TEXT_ABBREVIATED}}", candidateMonthTextAbbreviated)
        .replaceAll("{{CANDIDATE_DAY_NUMBER}}", candidateDayNumber)
        .replaceAll("{{JOB_NAME}}", job.name)
        .replaceAll("{{JOB_MONTH_TEXT}}", jobMonthText)
        .replaceAll("{{JOB_MONTH_NUMBER}}", jobMonthNumber)
        .replaceAll("{{JOB_MONTH_TEXT_ABBREVIATED}}", jobMonthTextAbbreviated)
        .replaceAll("{{JOB_DAY_NUMBER}}", jobDayNumber);
    channelName = sanitizeChannelName(channelName)
    return channelName;
}

export async function handleIndividualHiringroom(hiringroom){
    console.log('indivi room')
    const allJobs = await fetchJobsFromGreenhouse()
    console.log('indivi room1')
    let allCandidates = await fetchCandidates()
    console.log('indivi room2')
    const greenhouseUsers = await fetchGreenhouseUsers();
    console.log('hiring room3 - past green house')
    const slackTeamID = await getSlackTeamIDByHiringroomID(
        hiringroom.id,
    );
    console.log('indivi room4')
    const namingConvention = getNamingConvention(hiringroom)
    const slackUsers = await getEmailsfromSlack(slackTeamID);
    const userMapping = await matchUsers(
        greenhouseUsers,
        slackUsers,
    );
    // create job room - name job_title + date posted + time
    // create candidate room - name candidate_first_initial + candidate_last_name + job_title 
    console.log('5pre check object field - slack team id - ',slackTeamID)
    if (hiringroom.objectField == 'Candidates'){
        // hiringroom.recipient = buildHiringRoomRecipients()
        // const slackUserIds = getSlackUserIds()
        allCandidates.forEach(async (candidate)=>{
            const candidateFitsConditions = true //check()
            if(candidateFitsConditions){
                console.log('new cand')
                // create slack channel
                const channelName = buildSlackChannelName(hiringroom.slackChannelFormat, candidate, job);
                // const channelName = sanitizeChannelName(hiringroom.slackChannelFormat)
                // const channelName = sanitizeChannelName(candidate.id + "-" + candidate.name)
                const slackUsersIds = getSlackUsersFromRecipient(hiringroom.recipient)
                const slackIdsOfGreenHouseUsers = getSlackIdsOfGreenHouseUsers(hiringroom.recipient, candidate, userMapping)
                console.log('past 1')
                const slackUserIds = slackUsersIds.concat(slackIdsOfGreenHouseUsers)
                const messageText = "really good message text"
                const channelId = await createSlackChannel(channelName, slackTeamID);
                // does this mean successfully create NOW, not previously created?
                if (channelId) {
                    await inviteUsersToChannel(channelId, slackUserIds, slackTeamID);
                    const messageText = 'Welcome to the new hiring room!';
                    await postMessageToSlackChannel(channelId, messageText, slackTeamID);
                }
            }
        })
    }
    else if (hiringroom.objectField == 'Jobs'){
        console.log('go bucks hiring job')
        // console.log('hiring room -',hiringroom," ------- hiring room")

        allJobs.forEach(async (job)=>{
            const jobFitsConditions = true
            // const jobFitsConditions = check()
            if(jobFitsConditions){
                // create slack channel
                // let channelName = sanitizeChannelName(job.id + "-"+"1")
                // let channelName = sanitizeChannelName(job.id + "-"+"1")
                const channelName = buildSlackChannelName(hiringroom.slackChannelFormat, candidate, job);
                // channelName=channelName.substring(0,channelName.length-2)
                // channelName = channelName.substring(0,6)
                // channelName = channelName.substring(0,6)
                // generateRandomSixDigitNumber
                // const channelName = generateRandomSixDigitNumber()

                const slackUsersIds = getSlackUsersFromRecipient(hiringroom.recipient)
                // const slackIdsOfGreenHouseUsers = getSlackIdsOfGreenHouseUsers(hiringroom.recipient, candidate, userMapping)
                const slackUserIds = slackUsersIds // + slackIdsOfGreenHouseUsers
                // const slackUserIds = slackUsersIds + slackIdsOfGreenHouseUsers 
                console.log('create slack channel - ', slackTeamID)
                console.log('create slack channelName - ', channelName)
                
                const channelId = await createSlackChannel(channelName, slackTeamID);

                // does this mean successfully create NOW, not previously created?
                if (channelId) {
                    await inviteUsersToChannel(channelId, slackUserIds, slackTeamID);
                    // const messageText = 'Welcome to the new hiring room!';
                    // await postMessageToSlackChannel(channelId, messageText);
                }
            }
        })
    }
    return hiringroom
}

export async function handleHiringrooms(){
    const hiringrooms: HiringRoom[] = await getHiringrooms()
    if(hiringrooms.length > 0){
        for (const hiringroom of hiringrooms) {
            await handleIndividualHiringroom(hiringroom)
        }
    }
    return true
}
function sanitizeChannelName(name) {
    return name
        .toLowerCase() // convert to lowercase
        .replace(/[^a-z0-9-_]/g, '-') // replace invalid characters with hyphens
        .slice(0, 79); // ensure the name is less than 80 characters
}

function combineGreenhouseRolesAndSlackUsers(workflowRecipient){

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
        // console.log('candidates - ',candidates)
        candidates.forEach((cand) => {
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
    return allRecipients
}
export async function handleWorkflows(){
    try {
        const workflows: Workflow[] = await getWorkflows(); // Retrieve workflows from the database
        let shouldReturnNull = false; // Flag to determine whether to return null

        for (const workflow of workflows) {
            if (workflow.alertType === "timebased") {
              const { apiUrl } = workflow.triggerConfig;

              const data = await customFetch(apiUrl); // Fetch data using custom fetch wrapper
              console.log(data)

              let filteredConditionsData;
              console.log("workflow.objectField", workflow.objectField);
              switch (workflow.objectField) {
                  case "Scheduled Interviews":
                      filteredConditionsData = filterScheduledInterviewsWithConditions(
                          data,
                          workflow.conditions,
                      );

                      break;
                  default:
                      filteredConditionsData = filterDataWithConditions(
                          data,
                          workflow.conditions,
                      );
                      break;
              }
              console.log("filteredConditionsData", filteredConditionsData);
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
            } else if (workflow.alertType === "stuckin-stage") {
                const { apiUrl, processor } = workflow.triggerConfig;
                const data = await customFetch(
                    apiUrl,
                    processor ? { query: processor } : {},
                );
                console.log("cron-job running!!");
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
                // workflow.recipient = workflow.recipient.map((recipient: any) => {
                //     if (recipient.source === "greenhouse") {
                //         return addGreenhouseSlackValue(recipient, candidates, userMapping);
                //     }
                //     return recipient;
                // });
                const greenHouseAndSlackRecipients= combineGreenhouseRolesAndSlackUsers(workflow)
                // const matchGreenhouseUsers = matc
                // console.log("filteredConditionsData", filteredConditionsData);
                const filteredSlackDataWithMessage = await buildSlackMessageByCandidateOnFilteredData(
                    filteredConditionsData,
                    workflow.messageFields,
                    // slackTeamID
                );

                if (filteredSlackDataWithMessage.length > 0) {
                    await sendSlackButtonNotification(
                        filteredSlackData,
                        workflow.recipient,
                        slackTeamID,
                        subDomain,
                        userMapping,
                        filteredConditionsData,
                        greenHouseAndSlackRecipients
                    );
                } else {
                    console.log("No data to send to Slack");
                }
            } else if (workflow.alertType === "create-update") {
                // Logic for "create-update" conditions
            }
        }

        if (shouldReturnNull) {
            return false
            return NextResponse.json(
                { message: "No workflows to process" },
                { status: 200 },
            );
        }
        return true
        return NextResponse.json(
            { message: "Workflows processed successfully" },
            { status: 200 },
        );
    } catch (error: unknown) {
        console.error("Failed to process workflows:", error);
        return false
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
        console.log('gobucks')
        // await handleWorkflows()
        await handleHiringrooms()
        return NextResponse.json({ message: "Workflows processed successfully" }, { status: 200 });
}
    catch(e){
        console.log('eeee - ', e)
        return NextResponse.json({ message: "No workflows to process" }, { status: 200 }); 
    }
}

async function createSlackChannel(channelName, slackTeamId) {
    console.log('createSlackChannel - pre access token - ',slackTeamId)
    const accessToken = await getAccessToken(slackTeamId);

    try {
        const response = await fetch("https://slack.com/api/conversations.create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                name: channelName,
            }),
        });
        console.log('Name taken - ',channelName)

        const data = await response.json();
        if (!data.ok) {
            if(data.error == "name_taken"){
                console.log('Name taken - ',channelName)
                // throw new Error(`Error creating channel: ${data.error}`);

            }
            throw new Error(`Error creating channel: ${data.error}`);
        }

        console.log('Channel created successfully:');
        // console.log('Channel created successfully:', data);
        return data.channel.id; // Return the channel ID for further use
    } catch (error) {
        console.error('Error - createSlackChannel - creating Slack channel:', error);
    }
}

async function inviteUsersToChannel(channelId, userIds, slackTeamId) {
    try {
            console.log('userids - ',userIds)
            console.log('inviteuserstochannel - pre access token')

            const accessToken = await getAccessToken(slackTeamId);
            const response = await fetch("https://slack.com/api/conversations.invite", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    channel: channelId,
                    users: userIds.join(','),
                }),
            });

        const data = await response.json();
        if (!data.ok) {
            throw new Error(`Error inviting users: ${data.error}`);
        }

        console.log('Users invited successfully:', data);
    } catch (error) {
        console.error('Error inviting users to Slack channel:', error);
    }
}