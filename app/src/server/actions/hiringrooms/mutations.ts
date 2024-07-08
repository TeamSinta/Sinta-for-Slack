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
const hiringroomSchema = hiringroomInsertSchema.pick({
    name: true,
    objectField: true,
    alertType: true,
    organizationId: true,
    triggerConfig: true,
    recipient: true,
    conditions: true,
});

type CreateHiringRoomProps = z.infer<typeof hiringroomSchema>;

export async function createHiringRoomMutation(props: CreateHiringRoomProps) {
    const { user } = await protectedProcedure();
    const { currentOrg } = await getOrganizations();
    const orgID = currentOrg.id;

    const hiringroomParse = hiringroomSchema.safeParse(props);

    if (!hiringroomParse.success) {
        throw new Error(
            "Invalid hiringroom data: " +
                JSON.stringify(hiringroomParse.error.errors),
        );
    }

    const hiring_flowData = hiringroomParse.data;

    return await db
        .insert(hiringrooms)
        .values({
            name: hiring_flowData.name,
            objectField: hiring_flowData.objectField,
            alertType: hiring_flowData.alertType,
            conditions: hiring_flowData.conditions,
            recipient: hiring_flowData.recipient,
            organizationId: orgID,
            ownerId: user.id,
            triggerConfig: hiring_flowData.triggerConfig,
            createdAt: new Date(),
            modifiedAt: new Date(),
        })
        .execute();
}
/**
 * Update a hiring_flow
 */
const hiringroomUpdateSchema = hiringroomSelectSchema.pick({
    id: true,
    status: true,
    // other fields as necessary
});

type UpdateHiringRoomProps = z.infer<typeof hiringroomUpdateSchema>;

export async function updateHiringRoomMutation(props: UpdateHiringRoomProps) {
    await adminProcedure();

    const hiringroomParse = await hiringroomUpdateSchema.safeParseAsync(props);
    if (!hiringroomParse.success) {
        throw new Error("Invalid hiring_flow data", {
            cause: hiringroomParse.error.errors,
        });
    }

    return await db
        .update(hiringrooms)
        .set(hiringroomParse.data)
        .where(eq(hiringrooms.id, hiringroomParse.data.id))
        .execute();
}

/**
 * Delete a hiringroom
 */
export async function deleteHiringRoomMutation({ id }: { id: string }) {
    if (!id) throw new Error("Invalid hiring_flow ID");

    return await db.delete(hiringrooms).where(eq(hiringrooms.id, id)).execute();
}
