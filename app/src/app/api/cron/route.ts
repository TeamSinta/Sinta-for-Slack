/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { getAccessToken
 } from "@/server/actions/slack/query";

import { getEmailsfromSlack } from "@/server/slack/core";
import { fetchGreenhouseUsers, fetchJobsFromGreenhouse, fetchCandidates } from "@/server/greenhouse/core";
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
export async function handleHiringrooms(){
    console.log('handle hiring rooms')
    const hiringrooms: HiringRoom[] = await getHiringrooms()
    console.log('handle hiring rooms', hiringrooms.length)

    const allJobs = await fetchJobsFromGreenhouse()
    console.log('all jobs length - ', allJobs.length)
    let allCandidates = await fetchCandidates()
    // console.log('all jobs length - ', allJobs.length)
    console.log('allCandidates  length - ', allCandidates.length)
    // const filteredHiringrooms = filterHiringRooms
    if(hiringrooms.length > 0){
        // preparing to loop through - this is to avoid a fetch everytime, and to only do it if user has hiring rooms
        // to do - add conditions to filter less hiring rooms out?
     

    for (const hiring_room of hiringrooms) {
        // can optimize this later to store and not recall same candidates for same company, etc
        const greenhouseUsers = await fetchGreenhouseUsers();

        const slackTeamID = await getSlackTeamIDByHiringroomID(
            hiring_room.id,
        );
        const slackUsers = await getEmailsfromSlack(slackTeamID);
        const userMapping = await matchUsers(
            greenhouseUsers,
            slackUsers,
        );

    

        // create job room
        //    slack_channel_name = job_title + date posted + time
        //    slack_channel_name = job_id
        // create candidate room
        //    slack_channel_name = candidate_first_initial + candidate_last_name + job_title 
        //    slack_channel_name = cand_id + job_id 
        
        

        if (hiring_room.objectField == 'Candidates'){
            console.log('go bucks hiring candidate')
            console.log('hiring room -',hiring_room," ------- hiring room")

            // hiring_room.recipient = buildHiringRoomRecipients()
            // const slackUserIds = getSlackUserIds()
            allCandidates.forEach(async (candidate)=>{
                const candidateFitsConditions = true //check()
                if(candidateFitsConditions){
                    // create slack channel
                    const channelName = candidate.id
                    const slackUsersIds = getSlackUsersFromRecipient(hiring_room.recipient)
                    const slackIdsOfGreenHouseUsers = getSlackIdsOfGreenHouseUsers(hiring_room.recipient, candidate, userMapping)
                    const slackUserIds = slackUsersIds.concat(slackIdsOfGreenHouseUsers)
                    // const slackUserIds = slackUsersIds + slackIdsOfGreenHouseUsers
                    const messageText = "really good message text"
                    const channelId = await createSlackChannel(channelName, slackTeamID);

                    console.log('slackIdsOfGreenHouseUsers - ',slackIdsOfGreenHouseUsers)
                    console.log('slackUsersIds - ',slackUsersIds)
                    // does this mean successfully create NOW, not previously created?
                    if (channelId) {
                        await inviteUsersToChannel(channelId, slackUserIds, slackTeamID);
                        // const messageText = 'Welcome to the new hiring room!';
                        // await postMessageToSlackChannel(channelId, messageText, slackTeamID);
                    }
                



                    // await createSlackChannel(channelName, slackUserIds)
                }
            })
            // for a hiring flow candidate flow
            // for all the candidates
            // does channel exist for candidate that fits this hiring flow
            // greenhouseusers = getGreenHouseUsers(hiringflow.recipient)
            // slackUsers = hiringflow.recipient + greenhouseusers


        }
        else if (false && hiring_room.objectField == 'Jobs'){
            console.log('go bucks hiring job')
            console.log('hiring room -',hiring_room," ------- hiring room")

            allJobs.forEach(async (job)=>{
                const jobFitsConditions = true
                // const jobFitsConditions = check()
                if(jobFitsConditions){
                    // create slack channel
                    const channelName = job.id
                    const slackUsersIds = getSlackUsersFromRecipient(hiring_room.recipient)
                    // const slackIdsOfGreenHouseUsers = getSlackIdsOfGreenHouseUsers(hiring_room.recipient, candidate, job_id)
                    // const slackUserIds = slackUsersId
                    s //+ slackIdsOfGreenHouseUsers
                    // const slackUserIds = slackUsersIds + slackIdsOfGreenHouseUsers
                    console.log('createSlackChannel')

                    const slackIdsOfGreenHouseUsers = getSlackIdsOfGreenHouseUsers(hiring_room.recipient, candidate, userMapping, job_id)
                    const slackUserIds = slackUsersIds + slackIdsOfGreenHouseUsers
                    const messageText = "really good message text"
 
                    const channelId = await createSlackChannel(channelName);

                    // does this mean successfully create NOW, not previously created?
                    if (channelId) {
                        await inviteUsersToChannel(channelId, slackUserIds);
                        const messageText = 'Welcome to the new hiring room!';
                        await postMessageToSlackChannel(channelId, messageText);
                    }




                }
            })
        }

        // case 0
        // for each job
        //   create channel
        // for each job
        // foreach candidate in job
        // creat4e channel
        // case 1 - candidate - stage = interview
        // for each job
            // for each candidate in job
                // does candidate.stage == interview
        // case 2 - job
        // for each job
            // if 


        // if conditions met
        // if(hiring_room){
            
        //     handleHiringRoom(hiring_room)
        // }
    }
    }
    // if (shouldReturnNull) {
        // return false
        // return NextResponse.json({ message: "No workflows to process" }, { status: 200 }); 
    // }
    return true
    // return NextResponse.json({ message: "Workflows processed successfully" }, { status: 200 });

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

        const data = await response.json();
        if (!data.ok) {
            throw new Error(`Error creating channel: ${data.error}`);
        }

        console.log('Channel created successfully:');
        // console.log('Channel created successfully:', data);
        return data.channel.id; // Return the channel ID for further use
    } catch (error) {
        console.error('Error creating Slack channel:', error);
    }
}

async function inviteUsersToChannel(channelId, userIds, slackTeamId) {
    try {
            console.log('userids - ',userIds)
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