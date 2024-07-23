// server/actions/workflowMutations.js
"use server";

import { db } from "@/server/db";
import {
    workflows,
    workflowInsertSchema,
    workflowSelectSchema,
} from "@/server/db/schema";
import { protectedProcedure, adminProcedure } from "@/server/procedures";
import { eq } from "drizzle-orm";
import type { z } from "zod";
import { getOrganizations } from "../organization/queries";

/**
 * Create a new workflow
 */
const workflowFormSchema = workflowInsertSchema.pick({
    name: true,
    description: true,
    objectField: true,
    alertType: true,
    organizationId: true,
    triggerConfig: true,
    recipient: true,
    conditions: true,
});

type CreateWorkflowProps = z.infer<typeof workflowFormSchema>;

export async function createWorkflowMutation(props: CreateWorkflowProps) {
    const { user } = await protectedProcedure();
    const { currentOrg } = await getOrganizations();
    const orgID = currentOrg.id;

    const workflowParse = workflowFormSchema.safeParse(props);

    if (!workflowParse.success) {
        throw new Error(
            "Invalid workflow data: " +
                JSON.stringify(workflowParse.error.errors),
        );
    }

    const workflowData = workflowParse.data;

    return await db
        .insert(workflows)
        .values({
            name: workflowData.name,
            objectField: workflowData.objectField,
            alertType: workflowData.alertType,
            conditions: workflowData.conditions,
            recipient: workflowData.recipient,
            organizationId: orgID,
            ownerId: user.id,
            triggerConfig: workflowData.triggerConfig,
            createdAt: new Date(),
            modifiedAt: new Date(),
        })
        .execute();
}
/**
 * Update a workflow
 */
const workflowUpdateSchema = workflowSelectSchema.pick({
    id: true,
    status: true,
    // other fields as necessary
});

type UpdateWorkflowProps = z.infer<typeof workflowUpdateSchema>;

export async function updateWorkflowMutation(props: UpdateWorkflowProps) {
    await adminProcedure();

    const workflowParse = await workflowUpdateSchema.safeParseAsync(props);
    if (!workflowParse.success) {
        throw new Error("Invalid workflow data", {
            cause: workflowParse.error.errors,
        });
    }

    return await db
        .update(workflows)
        .set(workflowParse.data)
        .where(eq(workflows.id, workflowParse.data.id))
        .execute();
}

/**
 * Delete a workflow
 */
export async function deleteWorkflowMutation({ id }: { id: string }) {
    if (!id) throw new Error("Invalid workflow ID");

    return await db.delete(workflows).where(eq(workflows.id, id)).execute();
}
