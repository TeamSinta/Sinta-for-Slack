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
    receipient: true,
    conditions: true,
});

type CreateWorkflowProps = z.infer<typeof workflowFormSchema>;

export async function createWorkflowMutation(props: CreateWorkflowProps) {
    const { user } = await protectedProcedure();

    const { currentOrg } = await getOrganizations();

    const workflowParse = await workflowFormSchema.safeParseAsync(props);

    if (!workflowParse.success) {
        throw new Error("Invalid workflow data", {
            cause: workflowParse.error.errors,
        });
    }
    console.log(workflowParse.data);

    await db
        .insert(workflows)
        .values({
            name: workflowParse.data.name,
            objectField: workflowParse.data.objectField,
            alertType: workflowParse.data.alertType,
            conditions: workflowParse.data.conditions, // Add this property
            receipient: workflowParse.data.receipient, // Add this property
            organizationId: workflowParse.data.organizationId,
            ownerId: user.id, // Ensure this property is included
            triggerConfig: workflowParse.data.triggerConfig, // Add this property
            createdAt: new Date(),
            modifiedAt: new Date(),
        })
        .execute();
    const url = "https://slack.com/api/chat.postMessage";
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentOrg.slack_access_token}`,
    };
    const body = JSON.stringify({
        channel: "U06URRX3V0S", // Direct message to the user who submitted the modal
        text: `New ${workflowParse.data.name} Workflow Created :sparkles:`,
    });

    const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: body,
    });

    return response.json();
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
