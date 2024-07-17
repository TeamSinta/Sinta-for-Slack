"use server";

import { db } from "@/server/db";
// import { assignments } from "@/server/db/schema"; // Assuming AssignmentStatus is the enum type for status
import { asc, desc, eq, count, and, ilike, or, ne } from "drizzle-orm";
import { z } from "zod";
import { unstable_noStore as noStore } from "next/cache";
import { protectedProcedure } from "@/server/procedures";
import { getOrganizations } from "../organization/queries";
import { slackChannelsCreated } from "@/server/db/schema";

// Define a Zod schema with the specific enum values
const assignmentStatusSchema = z.enum(["Active", "Inactive", "Archived"]);

type GetPaginatedAssignmentsQueryProps = z.infer<
    typeof paginatedSlackChannelCreatedPropsSchema
>;
const paginatedSlackChannelCreatedPropsSchema = z.object({
    page: z.coerce.number().default(1),
    per_page: z.coerce.number().default(10),
    sort: z.string().optional(),
    name: z.string().optional(),
    status: assignmentStatusSchema.optional(), // Use Zod enum for validation
    ownerId: z.string().optional(),
});

type GetPaginatedSlackChannelCreatedQueryProps = z.infer<
    typeof paginatedSlackChannelCreatedPropsSchema
>;

// export async function getSlackChannelsCreated(
//     input: GetPaginatedSlackChannelCreatedQueryProps,
// ) {
//     noStore();

//     const { currentOrg } = await getOrganizations();

//     const offset = (input.page - 1) * input.per_page;
//     const [column, order] = (input.sort?.split(".") as [
//         keyof typeof slackChannelsCreated.$inferSelect | undefined,
//         "asc" | "desc" | undefined,
//     ]) ?? ["createdAt", "desc"];

//     const { data, total } = await db.transaction(async (tx) => {
//         const slackChannelsCreatedFilter = and(
//             eq(slackChannelsCreated.organizationId, currentOrg.id), // Primary filter by organization ID
//             or(
//                 input.name
//                     ? ilike(hiringrooms.name, `%${input.name}%`)
//                     : undefined,
//                 input.status ? eq(hiringrooms.status, input.status) : undefined,
//                 input.ownerId
//                     ? eq(hiringrooms.ownerId, input.ownerId)
//                     : undefined,
//             ),
//         );

//         const data = await tx
//             .select()
//             .from(hiringrooms)
//             .offset(offset)
//             .limit(input.per_page)
//             .where(hiringroomFilter)
//             .orderBy(
//                 column && column in hiringrooms
//                     ? order === "asc"
//                         ? asc(hiringrooms[column])
//                         : desc(hiringrooms[column])
//                     : desc(hiringrooms.createdAt),
//             )
//             .execute();

//         const total = await tx
//             .select({ count: count() })
//             .from(hiringrooms)
//             .where(hiringroomFilter)
//             .execute()
//             .then((res) => res[0]?.count ?? 0);

//         return { data, total };
//     });

//     const pageCount = Math.ceil(total / input.per_page);

//     return { data, pageCount, total };
// }

export async function getAssignments() {
    const { data } = await db.transaction(async (tx) => {
        // const data = await tx.select().from(assignments).execute();
        const data = {} as any
        return { data };
    });

    return data;
}
export async function getPaginatedAssignmentsQuery(
    input: GetPaginatedAssignmentsQueryProps,
) {
    noStore();

    // const { user } = await protectedProcedure();
    // const { currentOrg } = await getOrganizations();

    // const offset = (input.page - 1) * input.per_page;
    // const [column, order] = (input.sort?.split(".") as [
    //     keyof typeof assignments.$inferSelect | undefined,
    //     "asc" | "desc" | undefined,
    // ]) ?? ["createdAt", "desc"];

    // const { data, total } = await db.transaction(async (tx) => {
    //     const assignmentFilter = and(
    //         eq(assignments.organizationId, currentOrg.id), // Primary filter by organization ID
    //         eq(assignments.ownerId, user.id), // Ensure the owner ID matches the user ID
    //         or(
    //             input.name
    //                 ? ilike(assignments.name, `%${input.name}%`)
    //                 : undefined,
    //             input.status ? eq(assignments.status, input.status) : undefined,
    //             input.ownerId
    //                 ? eq(assignments.ownerId, input.ownerId)
    //                 : undefined,
    //         ),
    //     );

    //     const data = await tx
    //         .select()
    //         .from(assignments)
    //         .offset(offset)
    //         .limit(input.per_page)
    //         .where(assignmentFilter)
    //         .orderBy(
    //             column && column in assignments
    //                 ? order === "asc"
    //                     ? asc(assignments[column])
    //                     : desc(assignments[column])
    //                 : desc(assignments.createdAt),
    //         )
    //         .execute();

    //     const total = await tx
    //         .select({ count: count() })
    //         .from(assignments)
    //         .where(assignmentFilter)
    //         .execute()
    //         .then((res) => res[0]?.count ?? 0);

    //     return { data, total };
    // });

    // const pageCount = Math.ceil(total / input.per_page);

    // return { data, pageCount, total };
    return {}
}

export async function getPaginatedAssignmentsByOrgQuery(
    input: GetPaginatedAssignmentsQueryProps,
) {
    return {}
    // noStore();

    // const { currentOrg } = await getOrganizations();

    // const offset = (input.page - 1) * input.per_page;
    // const [column, order] = (input.sort?.split(".") as [
    //     keyof typeof assignments.$inferSelect | undefined,
    //     "asc" | "desc" | undefined,
    // ]) ?? ["createdAt", "desc"];
    // const { data, total } = await db.transaction(async (tx) => {
    //     const assignmentFilter = and(
    //         eq(assignments.organizationId, currentOrg.id), // Primary filter by organization ID
    //         or(
    //             input.name
    //                 ? ilike(assignments.name, `%${input.name}%`)
    //                 : undefined,
    //             input.status ? eq(assignments.status, input.status) : undefined,
    //             input.ownerId
    //                 ? eq(assignments.ownerId, input.ownerId)
    //                 : undefined,
    //         ),
    //     );

    //     const data = await tx
    //         .select()
    //         .from(assignments)
    //         .offset(offset)
    //         .limit(input.per_page)
    //         .where(assignmentFilter)
    //         .orderBy(
    //             column && column in assignments
    //                 ? order === "asc"
    //                     ? asc(assignments[column])
    //                     : desc(assignments[column])
    //                 : desc(assignments.createdAt),
    //         )
    //         .execute();

    //     const total = await tx
    //         .select({ count: count() })
    //         .from(assignments)
    //         .where(assignmentFilter)
    //         .execute()
    //         .then((res) => res[0]?.count ?? 0);

    //     return { data, total };
    // });

    // const pageCount = Math.ceil(total / input.per_page);

    // return { data, pageCount, total };
}

export async function getPaginatedAssignmentsExcludingUserQuery(
    input: GetPaginatedAssignmentsQueryProps,
) {
    // noStore();
    // const { user } = await protectedProcedure();
    // const { currentOrg } = await getOrganizations();

    // const offset = (input.page - 1) * input.per_page;
    // const [column, order] = (input.sort?.split(".") as [
    //     keyof typeof assignments.$inferSelect | undefined,
    //     "asc" | "desc" | undefined,
    // ]) ?? ["createdAt", "desc"];

    // const { data, total } = await db.transaction(async (tx) => {
    //     const assignmentFilter = and(
    //         eq(assignments.organizationId, currentOrg.id), // Primary filter by organization ID
    //         ne(assignments.ownerId, user.id), // Exclude assignments created by the current user
    //         or(
    //             input.name
    //                 ? ilike(assignments.name, `%${input.name}%`)
    //                 : undefined,
    //             input.status ? eq(assignments.status, input.status) : undefined,
    //             input.ownerId
    //                 ? eq(assignments.ownerId, input.ownerId)
    //                 : undefined,
    //         ),
    //     );

    //     const data = await tx
    //         .select()
    //         .from(assignments)
    //         .offset(offset)
    //         .limit(input.per_page)
    //         .where(assignmentFilter)
    //         .orderBy(
    //             column && column in assignments
    //                 ? order === "asc"
    //                     ? asc(assignments[column])
    //                     : desc(assignments[column])
    //                 : desc(assignments.createdAt),
    //         )
    //         .execute();

    //     const total = await tx
    //         .select({ count: count() })
    //         .from(assignments)
    //         .where(assignmentFilter)
    //         .execute()
    //         .then((res) => res[0]?.count ?? 0);

    //     return { data, total };
    // });

    // const pageCount = Math.ceil(total / input.per_page);

    // return { data, pageCount, total };
    return {}
}
