"use server";

import { db } from "@/server/db";
import { workflows } from "@/server/db/schema"; // Assuming WorkflowStatus is the enum type for status
import { asc, desc, eq, count, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { unstable_noStore as noStore } from "next/cache";

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

    const offset = (input.page - 1) * input.per_page;
    const [column, order] = (input.sort?.split(".") as [
        keyof typeof workflows.$inferSelect | undefined,
        "asc" | "desc" | undefined,
    ]) ?? ["createdAt", "desc"];

    const { data, total } = await db.transaction(async (tx) => {
        const data = await tx
            .select()
            .from(workflows)
            .offset(offset)
            .limit(input.per_page)
            .where(
                or(
                    input.name
                        ? ilike(workflows.name, `%${input.name}%`)
                        : undefined,
                    input.status
                        ? eq(workflows.status, input.status)
                        : undefined, // Ensure the correct enum type is used for comparison
                    input.ownerId
                        ? eq(workflows.ownerId, input.ownerId)
                        : undefined,
                ),
            )
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
            .where(
                or(
                    input.name
                        ? ilike(workflows.name, `%${input.name}%`)
                        : undefined,
                    input.status
                        ? eq(workflows.status, input.status)
                        : undefined,
                    input.ownerId
                        ? eq(workflows.ownerId, input.ownerId)
                        : undefined,
                ),
            )
            .execute()
            .then((res) => res[0]?.count ?? 0);

        return { data, total };
    });

    const pageCount = Math.ceil(total / input.per_page);

    return { data, pageCount, total };
}
