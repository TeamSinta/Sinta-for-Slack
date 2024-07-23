"use server";

import { db } from "@/server/db";
import { workflows } from "@/server/db/schema"; // Assuming WorkflowStatus is the enum type for status
import { asc, desc, eq, count, and, ilike, or, ne } from "drizzle-orm";
import { z } from "zod";
import { unstable_noStore as noStore } from "next/cache";
import { protectedProcedure } from "@/server/procedures";
import { getOrganizations } from "../organization/queries";

// Define a Zod schema with the specific enum values
const workflowStatusSchema = z.enum(["Active", "Inactive", "Archived"]);

const paginatedWorkflowPropsSchema = z.object({
    page: z.coerce.number().default(1),
    per_page: z.coerce.number().default(10),
    sort: z.string().optional(),
    name: z.string().optional(),
    status: workflowStatusSchema.optional(), // Use Zod enum for validation
    ownerId: z.string().optional(),
});

type GetPaginatedWorkflowsQueryProps = z.infer<
    typeof paginatedWorkflowPropsSchema
>;
export async function getWorkflowById(workflowId: string) {
    const { data } = await db.transaction(async (tx) => {
        const data = await tx.select().from(workflows).where(eq(workflows.id, workflowId)).execute();
        return { data: data[0] }; // Assuming the result is a single workflow object
    });
    return data;
}
export async function getWorkflows() {
    const { data } = await db.transaction(async (tx) => {
        const data = await tx.select().from(workflows).execute();

        return { data };
    });

    return data;
}
export async function getPaginatedWorkflowsQuery(
    input: GetPaginatedWorkflowsQueryProps,
) {
    noStore();

    const { user } = await protectedProcedure();
    const { currentOrg } = await getOrganizations();
    if (!currentOrg) {
        throw new Error("No current organization found.");
    }

    const offset = (input.page - 1) * input.per_page;
    const [column, order] = (input.sort?.split(".") as [
        keyof typeof workflows.$inferSelect | undefined,
        "asc" | "desc" | undefined,
    ]) ?? ["createdAt", "desc"];

    const { data, total } = await db.transaction(async (tx) => {
        const workflowFilter = and(
            eq(workflows.organizationId, currentOrg.id), // Primary filter by organization ID
            eq(workflows.ownerId, user.id), // Ensure the owner ID matches the user ID
            or(
                input.name
                    ? ilike(workflows.name, `%${input.name}%`)
                    : undefined,
                input.status ? eq(workflows.status, input.status) : undefined,
                input.ownerId
                    ? eq(workflows.ownerId, input.ownerId)
                    : undefined,
            ),
        );

        const data = await tx
            .select()
            .from(workflows)
            .offset(offset)
            .limit(input.per_page)
            .where(workflowFilter)
            .orderBy(
                column && column in workflows
                    ? order === "asc"
                        ? asc(workflows[column])
                        : desc(workflows[column])
                    : desc(workflows.createdAt),
            )
            .execute();

        const total = await tx
            .select({ count: count() })
            .from(workflows)
            .where(workflowFilter)
            .execute()
            .then((res) => res[0]?.count ?? 0);

        return { data, total };
    });

    const pageCount = Math.ceil(total / input.per_page);

    return { data, pageCount, total };
}

export async function getPaginatedWorkflowsByOrgQuery(
    input: GetPaginatedWorkflowsQueryProps,
) {
    noStore();

    const { currentOrg } = await getOrganizations();
    if (!currentOrg) {
        throw new Error("No current organization found.");
    }

    const offset = (input.page - 1) * input.per_page;
    const [column, order] = (input.sort?.split(".") as [
        keyof typeof workflows.$inferSelect | undefined,
        "asc" | "desc" | undefined,
    ]) ?? ["createdAt", "desc"];

    const { data, total } = await db.transaction(async (tx) => {
        const workflowFilter = and(
            eq(workflows.organizationId, currentOrg.id), // Primary filter by organization ID
            or(
                input.name
                    ? ilike(workflows.name, `%${input.name}%`)
                    : undefined,
                input.status ? eq(workflows.status, input.status) : undefined,
                input.ownerId
                    ? eq(workflows.ownerId, input.ownerId)
                    : undefined,
            ),
        );

        const data = await tx
            .select()
            .from(workflows)
            .offset(offset)
            .limit(input.per_page)
            .where(workflowFilter)
            .orderBy(
                column && column in workflows
                    ? order === "asc"
                        ? asc(workflows[column])
                        : desc(workflows[column])
                    : desc(workflows.createdAt),
            )
            .execute();

        const total = await tx
            .select({ count: count() })
            .from(workflows)
            .where(workflowFilter)
            .execute()
            .then((res) => res[0]?.count ?? 0);

        return { data, total };
    });

    const pageCount = Math.ceil(total / input.per_page);

    return { data, pageCount, total };
}

export async function getPaginatedWorkflowsExcludingUserQuery(
    input: GetPaginatedWorkflowsQueryProps,
) {
    noStore();
    const { user } = await protectedProcedure();
    const { currentOrg } = await getOrganizations();

    if (!currentOrg) {
        throw new Error("No current organization found.");
    }

    const offset = (input.page - 1) * input.per_page;
    const [column, order] = (input.sort?.split(".") as [
        keyof typeof workflows.$inferSelect | undefined,
        "asc" | "desc" | undefined,
    ]) ?? ["createdAt", "desc"];

    const { data, total } = await db.transaction(async (tx) => {
        const workflowFilter = and(
            eq(workflows.organizationId, currentOrg.id), // Primary filter by organization ID
            ne(workflows.ownerId, user.id), // Exclude workflows created by the current user
            or(
                input.name
                    ? ilike(workflows.name, `%${input.name}%`)
                    : undefined,
                input.status ? eq(workflows.status, input.status) : undefined,
                input.ownerId
                    ? eq(workflows.ownerId, input.ownerId)
                    : undefined,
            ),
        );

        const data = await tx
            .select()
            .from(workflows)
            .offset(offset)
            .limit(input.per_page)
            .where(workflowFilter)
            .orderBy(
                column && column in workflows
                    ? order === "asc"
                        ? asc(workflows[column])
                        : desc(workflows[column])
                    : desc(workflows.createdAt),
            )
            .execute();

        const total = await tx
            .select({ count: count() })
            .from(workflows)
            .where(workflowFilter)
            .execute()
            .then((res) => res[0]?.count ?? 0);

        return { data, total };
    });

    const pageCount = Math.ceil(total / input.per_page);

    return { data, pageCount, total };
}
