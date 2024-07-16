// server/actions/assignmentMutations.js
"use server";

import { db } from "@/server/db";
// import {
//     assignments,
//     assignmentInsertSchema,
//     assignmentSelectSchema,
// } from "@/server/db/schema";
import { protectedProcedure, adminProcedure } from "@/server/procedures";
import { eq } from "drizzle-orm";
import type { z } from "zod";
import { getOrganizations } from "../organization/queries";
import { getAccessToken } from "../slack/query";
import { slackChannelsCreated } from "@/server/db/schema";
// import { createSlackChannel } from "@/app/api/cron/route";

/**
 * Create a new assignment
 */
// const assignmentFormSchema = assignmentInsertSchema.pick({
//     name: true,
//     objectField: true,
//     alertType: true,
//     organizationId: true,
//     slackChannelFormat: true,
//     triggerConfig: true,
//     recipient: true,
//     conditions: true,
// });


// create slack channel via slack and save in db we created it
export async function createSlackChannel(channelName: any, slackTeamId: any) {
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


// type CreateAssignmentProps = z.infer<typeof assignmentFormSchema>;
export async function saveSlackChannelCreatedToDB(slackChannelId: any, invitedUsers: any, channelName: any, hiringroomId: any, slackChannelFormat: any, greenhouseCandidateId: any, greenhouseJobId: any){
    try{
        console.log('hiringroomId - ',hiringroomId)
        console.log('slackChannelId - ',slackChannelId)
        console.log('channelName - ',channelName)
        console.log('hiringroomId - ',hiringroomId)
        console.log('slackChannelFormat - ',slackChannelFormat)
        await db.insert(slackChannelsCreated).values({
            name: channelName,
            channelId: slackChannelId,
            createdBy: 'user_id', // Replace with actual user ID
            description: 'Channel description', // Optional
            isArchived: false,
            invitedUsers: invitedUsers,
            hiringroomId: hiringroomId, // Replace with actual hiring room ID
            channelFormat: slackChannelFormat, // Example format
            greenhouseCandidateId:greenhouseCandidateId,
            greenhouseJobId:greenhouseJobId,
            createdAt: new Date(),
            modifiedAt: new Date(), // Ensure this field is included
        });
        console.log('post success insert')
    }
    catch(e){
        throw new Error(`Error saving slack chanenl created: ${e}`);
    }
    return "success"

}

export async function inviteUsersToChannel(channelId: Promise<any>, userIds: any[], slackTeamId: string) {
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

export async function createAssignmentMutation(props: any) {
    const channelName = ''
    const slackTeamId = ''
    const channelId = createSlackChannel(channelName, slackTeamId)
    // invite users to slack channel
    if (channelId) {
        const slackUserIds = [] as any[]
        await inviteUsersToChannel(channelId, slackUserIds, slackTeamId);
        // const messageText = 'Welcome to the new hiring room!';
        // await postMessageToSlackChannel(channelId, messageText);
        // console.log('hiringroomId - ',hiringroomId)
        console.log('channelName - ',channelName)
        const hiringroomId = ''
        const hiringroomSlackChannelFormat = ''
        const jobId = ''
        const candidateId = ''
        //saveSlackChannelCreatedToDB(slackChannelId, invitedUsers, channelName, hiringroomId, slackChannelFormat, greenhouseCandidateId, greenhouseJobId){

        await saveSlackChannelCreatedToDB(channelId, slackUserIds, channelName, hiringroomId, hiringroomSlackChannelFormat,candidateId,jobId)
    }
    return
    // export async function createAssignmentMutation(props: CreateAssignmentProps) {
    // const { user } = await protectedProcedure();
    // const { currentOrg } = await getOrganizations();
    // const orgID = currentOrg.id;

    // const assignmentParse = assignmentFormSchema.safeParse(props);

    // if (!assignmentParse.success) {
    //     throw new Error(
    //         "Invalid assignment data: " +
    //             JSON.stringify(assignmentParse.error.errors),
    //     );
    // }

    // const assignmentData = assignmentParse.data;

    // const result = await db
    //     .insert(assignments)
    //     .values({
    //         name: assignmentData.name,
    //         objectField: assignmentData.objectField,
    //         alertType: assignmentData.alertType,
    //         conditions: assignmentData.conditions,
    //         recipient: assignmentData.recipient,
    //         organizationId: orgID,
    //         ownerId: user.id,
    //         triggerConfig: assignmentData.triggerConfig,
    //         slackChannelFormat: assignmentData.slackChannelFormat,
    //         createdAt: new Date(),
    //         modifiedAt: new Date(),
    //     })
    //     .returning({
    //         id: assignments.id,
    //         name: assignments.name,
    //         objectField: assignments.objectField,
    //         alertType: assignments.alertType,
    //         conditions: assignments.conditions,
    //         recipient: assignments.recipient,
    //         organizationId: assignments.organizationId,
    //         ownerId: assignments.ownerId,
    //         triggerConfig: assignments.triggerConfig,
    //         slackChannelFormat: assignments.slackChannelFormat,
    //         createdAt: assignments.createdAt,
    //         modifiedAt: assignments.modifiedAt,
    //     }) // Specify the fields you need to return
    //     // .returning("*") // Return all fields or specify the fields you need
    //     .execute();
    // // Assuming result is an array and we want the first (and only) record
    // return result[0];
}
/**
 * Update a assignment
 */
// const assignmentUpdateSchema = assignmentSelectSchema.pick({
//     id: true,
//     status: true,
//     // other fields as necessary
// });

// type UpdateAssignmentProps = z.infer<typeof assignmentUpdateSchema>;

export async function updateAssignmentMutation(props: any) {
    // export async function updateAssignmentMutation(props: UpdateAssignmentProps) {
    return
    // await adminProcedure();

    // const assignmentParse = await assignmentUpdateSchema.safeParseAsync(props);
    // if (!assignmentParse.success) {
    //     throw new Error("Invalid assignment data", {
    //         cause: assignmentParse.error.errors,
    //     });
    // }

    // return await db
    //     .update(assignments)
    //     .set(assignmentParse.data)
    //     .where(eq(assignments.id, assignmentParse.data.id))
    //     .execute();
}

/**
 * Delete a assignment
 */
export async function deleteAssignmentMutation({ id }: { id: string }) {
    return
    // if (!id) throw new Error("Invalid assignment ID");

    // return await db.delete(assignments).where(eq(assignments.id, id)).execute();
}

