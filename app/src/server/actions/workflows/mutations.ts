// server/actions/workflowMutations.js
"use server";

import { db } from "@/server/db";
import {
    workflows,
    workflowInsertSchema,
    workflowSelectSchema,
} from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedures";
import { eq } from "drizzle-orm";
import type { z } from "zod";
import { getOrganizations } from "../organization/queries";
import MixpanelServer from "@/server/mixpanel";
import { getServerAuthSession } from "@/server/auth";

/**
 * Create a new workflow
 */
const workflowFormSchema = workflowInsertSchema.pick({
    name: true,
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
    name: true,
    objectField: true,
    alertType: true,
    organizationId: true,
    triggerConfig: true,
    recipient: true,
    conditions: true,
    status: true,
    // other fields as necessary
});
const workflowStatusUpdateSchema = workflowSelectSchema.pick({
    id: true,
    status: true,
    // other fields as necessary
});

type UpdateWorkflowProps = z.infer<typeof workflowUpdateSchema>;

export async function updateWorkflowMutation(props: UpdateWorkflowProps) {
    // await adminProcedure();
    try {
        // console.log("props", props);
        const workflowParse = await workflowUpdateSchema.safeParseAsync(props);
        // console.log("workflows parse ", workflowParse);
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
    } catch (e) {
        console.log("wtf  eeeee -", e);
        throw e;
    }
}
type UpdateWorkflowStatusProps = z.infer<typeof workflowStatusUpdateSchema>;

export async function updateWorkflowStatusMutation(
    props: UpdateWorkflowStatusProps,
) {
    try {
        const workflowParse =
            await workflowStatusUpdateSchema.safeParseAsync(props);
        if (!workflowParse.success) {
            throw new Error("Invalid workflow data", {
                cause: workflowParse.error.errors,
            });
        }
        const res = await db
            .update(workflows)
            .set({ status: workflowParse.data.status })
            .where(eq(workflows.id, workflowParse.data.id))
            .execute();

        let eventTitle = null;
        const session = await getServerAuthSession();
        const { currentOrg } = await getOrganizations();
        if (workflowParse.data.status === "Active")
            eventTitle = "Workflow Activated";
        else if (workflowParse.data.status === "Inactive")
            eventTitle = "Workflow Deactivated";

        if (eventTitle)
            MixpanelServer.track(eventTitle, {
                workflow_id: workflowParse.data.id,
                user_id: session?.user?.id,
                organization_id: currentOrg.id,
            });
        return res;
    } catch (e) {
        console.log("wtf  eeeee -", e);
        throw e;
    }
}

/**
 * Update a workflow name
 */

const workflowNameUpdateSchema = workflowSelectSchema.pick({
    id: true,
    name: true,
    // other fields as necessary
});

type UpdateWorkflowNameProps = z.infer<typeof workflowNameUpdateSchema>;

export async function updateWorkflowNameMutation(
    props: UpdateWorkflowNameProps,
) {
    try {
        const workflowParse =
            await workflowNameUpdateSchema.safeParseAsync(props);
        if (!workflowParse.success) {
            throw new Error("Invalid workflow data", {
                cause: workflowParse.error.errors,
            });
        }

        return await db
            .update(workflows)
            .set({ name: workflowParse.data.name })
            .where(eq(workflows.id, workflowParse.data.id))
            .execute();
    } catch (e) {
        console.error("Error updating workflow name:", e);
        throw e;
    }
}

/**
 * Delete a workflow
 */
export async function deleteWorkflowMutation({ id }: { id: string }) {
    if (!id) throw new Error("Invalid workflow ID");

    const res = await db
        .delete(workflows)
        .where(eq(workflows.id, id))
        .execute();
    const session = await getServerAuthSession();
    const { currentOrg } = await getOrganizations();
    MixpanelServer.track("Workflow Deleted", {
        workflow_id: id,
        user_id: session?.user?.id,
        organization_id: currentOrg.id,
    });
    return res;
}
