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

// type CreateAssignmentProps = z.infer<typeof assignmentFormSchema>;


export async function createAssignmentMutation(props: any) {
    // export async function createAssignmentMutation(props: CreateAssignmentProps) {
    return
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
