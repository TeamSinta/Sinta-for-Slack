// server/actions/hiringroomMutations.js
"use server";

import { db } from "@/server/db";
import {
    hiringrooms,
    hiringroomInsertSchema,
    hiringroomSelectSchema,
} from "@/server/db/schema";
import { protectedProcedure, adminProcedure } from "@/server/procedures";
import { eq } from "drizzle-orm";
import type { z } from "zod";
import { getOrganizations } from "../organization/queries";

/**
 * Create a new hiringroom
 */
const hiringroomFormSchema = hiringroomInsertSchema.pick({
    name: true,
    objectField: true,
    alertType: true,
    organizationId: true,
    slackChannelFormat: true,
    triggerConfig: true,
    recipient: true,
    conditions: true,
    actions: true,
});

type CreateHiringroomProps = z.infer<typeof hiringroomFormSchema>;

export async function createHiringroomMutation(props: CreateHiringroomProps) {
    const { user } = await protectedProcedure();
    const { currentOrg } = await getOrganizations();
    const orgID = currentOrg.id;

    const hiringroomParse = hiringroomFormSchema.safeParse(props);

    if (!hiringroomParse.success) {
        throw new Error(
            "Invalid hiringroom data: " +
                JSON.stringify(hiringroomParse.error.errors),
        );
    }

    const hiringroomData = hiringroomParse.data;

    const result = await db
        .insert(hiringrooms)
        .values({
            name: hiringroomData.name,
            objectField: hiringroomData.objectField,
            alertType: hiringroomData.alertType,
            conditions: hiringroomData.conditions,
            recipient: hiringroomData.recipient,
            organizationId: orgID,
            ownerId: user.id,
            triggerConfig: hiringroomData.triggerConfig,
            slackChannelFormat: hiringroomData.slackChannelFormat,
            actions: hiringroomData.actions, // Add actions to the insertion
            createdAt: new Date(),
            modifiedAt: new Date(),
        })
        .returning({
            id: hiringrooms.id,
            name: hiringrooms.name,
            objectField: hiringrooms.objectField,
            alertType: hiringrooms.alertType,
            conditions: hiringrooms.conditions,
            recipient: hiringrooms.recipient,
            organizationId: hiringrooms.organizationId,
            ownerId: hiringrooms.ownerId,
            triggerConfig: hiringrooms.triggerConfig,
            slackChannelFormat: hiringrooms.slackChannelFormat,
            actions: hiringrooms.actions, // Return actions as well
            createdAt: hiringrooms.createdAt,
            modifiedAt: hiringrooms.modifiedAt,
        })
        .execute();

    return result[0];
}

/**
 * Update a hiringroom
 */
// const hiringroomUpdateSchema = hiringroomSelectSchema.pick({
//     id: true,
//     status: true,
//     // other fields as necessary
// });

type UpdateHiringroomProps = z.infer<typeof hiringroomFormSchema>;

export async function updateHiringroomMutation(props: UpdateHiringroomProps) {
    // await adminProcedure();
    const { user } = await protectedProcedure();
    // const { currentOrg } = await getOrganizations();
    // const orgID = currentOrg.id;

    const hiringroomParse = await hiringroomSelectSchema.safeParseAsync(props);
    if (!hiringroomParse.success) {
        throw new Error("Invalid hiringroom data", {
            cause: hiringroomParse.error.errors,
        });
    }

    // console.log("HIRING ROOM PARSE", hiringroomParse.data);

    return await db
        .update(hiringrooms)
        .set(hiringroomParse.data)
        .where(eq(hiringrooms.id, hiringroomParse.data.id))
        .execute();
}

/**
 * Delete a hiringroom
 */
export async function deleteHiringroomMutation({ id }: { id: string }) {
    if (!id) throw new Error("Invalid hiringroom ID");

    return await db.delete(hiringrooms).where(eq(hiringrooms.id, id)).execute();
}
