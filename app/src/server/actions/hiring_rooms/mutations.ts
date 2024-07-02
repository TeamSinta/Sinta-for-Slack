// server/actions/hiring_roomMutations.js
"use server";

import { db } from "@/server/db";
import {
    hiring_rooms,
    hiring_roomInsertSchema,
    hiring_roomSelectSchema,
} from "@/server/db/schema";
import { protectedProcedure, adminProcedure } from "@/server/procedures";
import { eq } from "drizzle-orm";
import type { z } from "zod";
import { getOrganizations } from "../organization/queries";

/**
 * Create a new hiring_room
 */
const hiring_roomSchema = hiring_roomInsertSchema.pick({
    name: true,
    objectField: true,
    alertType: true,
    organizationId: true,
    triggerConfig: true,
    recipient: true,
    conditions: true,
});

type CreateHiringRoomProps = z.infer<typeof hiring_roomSchema>;

export async function createHiringRoomMutation(props: CreateHiringRoomProps) {
    const { user } = await protectedProcedure();
    const { currentOrg } = await getOrganizations();
    const orgID = currentOrg.id;

    const hiring_roomParse = hiring_roomSchema.safeParse(props);

    if (!hiring_roomParse.success) {
        throw new Error(
            "Invalid hiring_room data: " +
                JSON.stringify(hiring_roomParse.error.errors),
        );
    }

    const hiring_flowData = hiring_roomParse.data;

    return await db
        .insert(hiring_rooms)
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
const hiring_roomUpdateSchema = hiring_roomSelectSchema.pick({
    id: true,
    status: true,
    // other fields as necessary
});

type UpdateHiringRoomProps = z.infer<typeof hiring_roomUpdateSchema>;

export async function updateHiringRoomMutation(props: UpdateHiringRoomProps) {
    await adminProcedure();

    const hiring_roomParse = await hiring_roomUpdateSchema.safeParseAsync(props);
    if (!hiring_roomParse.success) {
        throw new Error("Invalid hiring_flow data", {
            cause: hiring_roomParse.error.errors,
        });
    }

    return await db
        .update(hiring_rooms)
        .set(hiring_roomParse.data)
        .where(eq(hiring_rooms.id, hiring_roomParse.data.id))
        .execute();
}

/**
 * Delete a hiring_room
 */
export async function deleteHiringRoomMutation({ id }: { id: string }) {
    if (!id) throw new Error("Invalid hiring_flow ID");

    return await db.delete(hiring_rooms).where(eq(hiring_rooms.id, id)).execute();
}
