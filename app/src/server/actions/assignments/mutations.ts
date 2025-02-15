// @ts-nocheck

// server/actions/assignmentMutations.js
"use server";

import { db } from "@/server/db";
import { getAccessToken } from "../slack/query";
import { slackChannelsCreated } from "@/server/db/schema";
import { createSlackChannel, inviteUsersToChannel } from "@/server/slack/core";

// type CreateAssignmentProps = z.infer<typeof assignmentFormSchema>;
export async function saveSlackChannelCreatedToDB(
    slackChannelId: any,
    invitedUsers: any,
    channelName: any,
    hiringroomId: any,
    slackChannelFormat: any,
    greenhouseCandidateId: any,
    greenhouseJobId: any,
) {
    try {
        console.log("channelName - ", channelName);
        console.log("slackChannelId - ", slackChannelId);
        console.log("hiringroomId - ", hiringroomId);
        console.log("invitedUsers - ", invitedUsers);
        console.log("slackChannelFormat - ", slackChannelFormat);
        console.log("greenhouseCandidateId - ", greenhouseCandidateId);
        console.log("greenhouseJobId - ", greenhouseJobId);
        const result = await db
            .insert(slackChannelsCreated)
            .values({
                name: channelName,
                channelId: slackChannelId,
                createdBy: "user_id", // Replace with actual user ID
                description: "Channel description", // Optional
                isArchived: false,
                invitedUsers: invitedUsers ? invitedUsers : [],
                hiringroomId: hiringroomId ? hiringroomId : "", // Ensure this field is included
                channelFormat: slackChannelFormat ? slackChannelFormat : "", // Example format
                greenhouseCandidateId: greenhouseCandidateId
                    ? greenhouseCandidateId
                    : "",
                greenhouseJobId: greenhouseJobId ? greenhouseJobId : "",
                createdAt: new Date(),
                // modifiedAt: new Date(), // Ensure this field is included
            })
            .returning({
                name: slackChannelsCreated.name,
                channelId: slackChannelsCreated.channelId,
                createdBy: slackChannelsCreated.createdBy, // Replace with actual user ID
                description: slackChannelsCreated.description, // Optional
                isArchived: slackChannelsCreated.isArchived,
                invitedUsers: slackChannelsCreated.invitedUsers,
                hiringroomId: slackChannelsCreated.hiringroomId, // Ensure this field is included
                channelFormat: slackChannelsCreated.channelFormat, // Example format
                greenhouseCandidateId:
                    slackChannelsCreated.greenhouseCandidateId,
                greenhouseJobId: slackChannelsCreated.greenhouseJobId,
                createdAt: slackChannelsCreated.createdAt,
                // modifiedAt: slackChannelsCreated.modifiedAt, // Ensure this field is included
            })
            .execute();
        // Assuming result is an array and we want the first (and only) record
        return result[0];
    } catch (e) {
        throw new Error(`Error saving slack chanenl created: ${e}`);
    }
    return "success";
}

export async function createAssignmentMutation(props: any) {
    const channelName = "";
    const slackTeamId = "";
    const channelId = createSlackChannel(channelName, slackTeamId);
    // invite users to slack channel
    if (channelId) {
        const slackUserIds = [] as any[];
        await inviteUsersToChannel(channelId, slackUserIds, slackTeamId);
        // const messageText = 'Welcome to the new hiring room!';
        // await postMessageToSlackChannel(channelId, messageText);
        // console.log('hiringroomId - ',hiringroomId)
        console.log("channelName - ", channelName);
        const hiringroomId = "";
        const hiringroomSlackChannelFormat = "";
        const jobId = "";
        const candidateId = "";
        //saveSlackChannelCreatedToDB(slackChannelId, invitedUsers, channelName, hiringroomId, slackChannelFormat, greenhouseCandidateId, greenhouseJobId){

        await saveSlackChannelCreatedToDB(
            channelId,
            slackUserIds,
            channelName,
            hiringroomId,
            hiringroomSlackChannelFormat,
            candidateId,
            jobId,
        );
    }
    return;
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
    return;
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
    return;
    // if (!id) throw new Error("Invalid assignment ID");

    // return await db.delete(assignments).where(eq(assignments.id, id)).execute();
}
