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
import { buildSlackMessageByCandidateOnFilteredData, matchUsers } from "@/lib/slack";
import {
    sendSlackButtonNotification,
    sendSlackNotification,
} from "@/server/slack/core";
import { customFetch } from "@/utils/fetch";
import { getSlackTeamIDByWorkflowID } from "@/server/actions/slack/query";
import { getSubdomainByWorkflowID } from "@/server/actions/organization/queries";
import {addGreenhouseSlackValue} from '@/lib/slack'


// naming change? why mutation??
// async function handleHiringRoom(hiring_room){
//     const channelName = "gobucks";
//     const userEmails = ["gobucks@yahoo.com","giannis@gmail.com"];
//     await createSlackChannel(channelName, userEmails)

// }
// Define the GET handler for the route
async function getAllJobs(){
    //https://harvest.greenhouse.io/v1/candidates
    const jobOpeningsUrl = 'https://harvest.greenhouse.io/v1/jobs'
    const data = await customFetch(jobOpeningsUrl); // Fetch data using custom fetch wrapper

}
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
function buildGreenHouseUsersForCandidate(hiring_room_recipient, cand_id, job_id){
    hiring_room_recipient.forEach((recipient)=>{
        if(recipient.source == "greenhouse"){
            
        }
    })
}
export async function handleHiringrooms(){
    const hiringroom: HiringRoom[] = await getHiringRooms()
    const allJobs = await getAllJobs()
    let allCandidates = await getAllCandidates()
    // const filteredHiringrooms = filterHiringRooms
    if(filteredHiringRooms.length > 0){

        const greenhouseUsers = await fetchGreenhouseUsers();
        const slackUsers = await getEmailsfromSlack(slackTeamID);
        const userMapping = await matchUsers(
            greenhouseUsers,
            slackUsers,
        );
    }
    for (const hiring_room of filteredHiringrooms) {

        // create job room
        //    slack_channel_name = job_title + date posted + time
        //    slack_channel_name = job_id
        // create candidate room
        //    slack_channel_name = candidate_first_initial + candidate_last_name + job_title 
        //    slack_channel_name = cand_id + job_id 
        
        

        if (hiring_room.type == 'candidate'){
            // hiring_room.recipient = buildHiringRoomRecipients()
            // const slackUserIds = getSlackUserIds()
            allCandidates.forEach((candidate)=>{
                const channelName = candidate.id
                const greenHouseUsers = buildGreenHouseUsersForCandidate(hiring_room.recipient, cand_id, job_id)
                await createSlackChannel(channelName, slackUserIds)
            })
            // for a hiring flow candidate flow
            // for all the candidates
            // does channel exist for candidate that fits this hiring flow
            // greenhouseusers = getGreenHouseUsers(hiringflow.recipient)
            // slackUsers = hiringflow.recipient + greenhouseusers


        }
        else if (hiring_room.type == 'job'){
            hiring_room.recipient = buildHiringRoomRecipients()
            allJobs.forEach((job)=>{
                const channelName = job.id;
                await createSlackChannel(channelName, userEmails)
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

    if (shouldReturnNull) {
        return false
        // return NextResponse.json({ message: "No workflows to process" }, { status: 200 }); 
    }
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
                workflow.recipient = workflow.recipient.map((recipient: any) => {
                    if (recipient.source === "greenhouse") {
                        return addGreenhouseSlackValue(recipient, candidates, userMapping);
                    }
                    return recipient;
                });
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
            console.log("hereererere");
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
        await handleWorkflows()
        await handleHiringrooms()
        return NextResponse.json({ message: "Workflows processed successfully" }, { status: 200 });
}
    catch(e){
        console.log('eeee - ', e)
        return NextResponse.json({ message: "No workflows to process" }, { status: 200 }); 
    }
}

async function createSlackChannel(channelName, userIds) {
    // async function createSlackChannel(channelName, userEmails) {
    try {
      // Step 1: Create the channel
      const channelResponse = await slackClient.conversations.create({
        name: channelName,
      });
  
      const channelId = channelResponse.channel.id;
      console.log(`Channel created with ID: ${channelId}`);
  
    //   // Step 2: Get user IDs from emails
    //   const userIds = await Promise.all(userEmails.map(async (email) => {
    //     const userResponse = await slackClient.users.lookupByEmail({ email });
    //     return userResponse.user.id;
    //   }));
  
      console.log(`User IDs: ${userIds}`);
  
      // Step 3: Invite users to the channel
      await slackClient.conversations.invite({
        channel: channelId,
        users: userIds.join(','),
      });
  
      console.log(`Users invited to channel: ${channelName}`);
    } catch (error) {
      console.error('Error creating Slack channel:', error);
    }
  }