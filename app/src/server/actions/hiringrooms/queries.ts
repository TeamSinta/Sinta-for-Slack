"use server";

import { db } from "@/server/db";
import { hiringrooms, slackChannelsCreated } from "@/server/db/schema"; // Assuming HiringroomStatus is the enum type for status
import { asc, desc, eq, count, and, ilike, or, ne } from "drizzle-orm";
import { z } from "zod";
import { unstable_noStore as noStore } from "next/cache";
import { protectedProcedure } from "@/server/procedures";
import { getOrganizations } from "../organization/queries";

// Define a Zod schema with the specific enum values
const hiringroomStatusSchema = z.enum(["Active", "Inactive", "Archived"]);

const paginatedHiringroomPropsSchema = z.object({
    page: z.coerce.number().default(1),
    per_page: z.coerce.number().default(10),
    sort: z.string().optional(),
    name: z.string().optional(),
    status: hiringroomStatusSchema.optional(), // Use Zod enum for validation
    ownerId: z.string().optional(),
});

const paginatedCandidatePropsSchema = z.object({
    page: z.coerce.number().default(1),
    per_page: z.coerce.number().default(10),
    sort: z.string().optional(),
    name: z.string().optional(),
    status: hiringroomStatusSchema.optional(), // Use Zod enum for validation
    ownerId: z.string().optional(),
});

type GetPaginatedHiringroomsQueryProps = z.infer<
    typeof paginatedHiringroomPropsSchema
>;

type GetPaginatedCandidatesQueryProps = z.infer<
    typeof paginatedCandidatePropsSchema
>;

export async function getSlackChannelsCreated() {
    const data = await db.transaction(async (tx) => {
        const data = await tx.select().from(slackChannelsCreated).execute();

        return { data };
    });

    return data;
}
const slackChannelsCreatedStatusSchema = z.enum([
    "Active",
    "Inactive",
    "Archived",
]);

const paginatedSlackChannelCreatedPropsSchema = z.object({
    page: z.coerce.number().default(1),
    per_page: z.coerce.number().default(10),
    sort: z.string().optional(),
    name: z.string().optional(),
    status: slackChannelsCreatedStatusSchema.optional(), // Use Zod enum for validation
    ownerId: z.string().optional(),
    isArchived: z.boolean().optional(),
});

type GetPaginatedSlackChannelCreatedQueryProps = z.infer<
    typeof paginatedSlackChannelCreatedPropsSchema
>;
export async function getSlackChannelsCreatedPromise(
    input: GetPaginatedSlackChannelCreatedQueryProps,
) {
    console.log("input - ", input);
    const { currentOrg } = await getOrganizations();

    const offset = (input.page - 1) * input.per_page;
    const [column, order] = (input.sort?.split(".") as [
        keyof typeof slackChannelsCreated.$inferSelect | undefined,
        "asc" | "desc" | undefined,
    ]) ?? ["createdAt", "desc"];

    const { data, total } = await db.transaction(async (tx) => {
        const data = await tx
            .select()
            .from(slackChannelsCreated)
            .offset(offset)
            .limit(input.per_page)
            .orderBy(
                column && column in slackChannelsCreated
                    ? order === "asc"
                        ? asc(slackChannelsCreated[column])
                        : desc(slackChannelsCreated[column])
                    : desc(slackChannelsCreated.createdAt),
            )
            .execute();
        const total = await tx
            .select({ count: count() })
            .from(slackChannelsCreated)
            .execute()
            .then((res) => res[0]?.count ?? 0);
        return { data, total };
    });

    const pageCount = Math.ceil(total / input.per_page);

    return { data, pageCount, total };
    //
    // return data;
}
export async function getHiringrooms() {
    const { data } = await db.transaction(async (tx) => {
        const data = await tx.select().from(hiringrooms).execute();

        return { data };
    });

    return data;
}
export async function getPaginatedHiringroomsQuery(
    input: GetPaginatedHiringroomsQueryProps,
) {
    noStore();

    const { user } = await protectedProcedure();
    const { currentOrg } = await getOrganizations();

    const offset = (input.page - 1) * input.per_page;
    const [column, order] = (input.sort?.split(".") as [
        keyof typeof hiringrooms.$inferSelect | undefined,
        "asc" | "desc" | undefined,
    ]) ?? ["createdAt", "desc"];

    const { data, total } = await db.transaction(async (tx) => {
        const hiringroomFilter = and(
            eq(hiringrooms.organizationId, currentOrg.id), // Primary filter by organization ID
            eq(hiringrooms.ownerId, user.id), // Ensure the owner ID matches the user ID
            or(
                input.name
                    ? ilike(hiringrooms.name, `%${input.name}%`)
                    : undefined,
                input.status ? eq(hiringrooms.status, input.status) : undefined,
                input.ownerId
                    ? eq(hiringrooms.ownerId, input.ownerId)
                    : undefined,
            ),
        );

        const data = await tx
            .select()
            .from(hiringrooms)
            .offset(offset)
            .limit(input.per_page)
            .where(hiringroomFilter)
            .orderBy(
                column && column in hiringrooms
                    ? order === "asc"
                        ? asc(hiringrooms[column])
                        : desc(hiringrooms[column])
                    : desc(hiringrooms.createdAt),
            )
            .execute();

        const total = await tx
            .select({ count: count() })
            .from(hiringrooms)
            .where(hiringroomFilter)
            .execute()
            .then((res) => res[0]?.count ?? 0);

        return { data, total };
    });

    const pageCount = Math.ceil(total / input.per_page);

    return { data, pageCount, total };
}

export async function getPaginatedCandidatesQuery(
    input: GetPaginatedCandidatesQueryProps,
) {
    noStore();

    const { user } = await protectedProcedure();
    const { currentOrg } = await getOrganizations();

    const offset = (input.page - 1) * input.per_page;
    const [column, order] = (input.sort?.split(".") as [
        keyof typeof hiringrooms.$inferSelect | undefined,
        "asc" | "desc" | undefined,
    ]) ?? ["createdAt", "desc"];

    const { data, total } = await db.transaction(async (tx) => {
        const hiringroomFilter = and(
            eq(hiringrooms.organizationId, currentOrg.id), // Primary filter by organization ID
            eq(hiringrooms.ownerId, user.id), // Ensure the owner ID matches the user ID
            or(
                input.name
                    ? ilike(hiringrooms.name, `%${input.name}%`)
                    : undefined,
                input.status ? eq(hiringrooms.status, input.status) : undefined,
                input.ownerId
                    ? eq(hiringrooms.ownerId, input.ownerId)
                    : undefined,
            ),
        );

        const data = await tx
            .select()
            .from(hiringrooms)
            .offset(offset)
            .limit(input.per_page)
            .where(hiringroomFilter)
            .orderBy(
                column && column in hiringrooms
                    ? order === "asc"
                        ? asc(hiringrooms[column])
                        : desc(hiringrooms[column])
                    : desc(hiringrooms.createdAt),
            )
            .execute();

        const total = await tx
            .select({ count: count() })
            .from(hiringrooms)
            .where(hiringroomFilter)
            .execute()
            .then((res) => res[0]?.count ?? 0);

        return { data, total };
    });

    const pageCount = Math.ceil(total / input.per_page);

    return { data, pageCount, total };
}

export async function getPaginatedHiringroomsByOrgQuery(
    input: GetPaginatedHiringroomsQueryProps,
) {
    noStore();

    const { currentOrg } = await getOrganizations();

    const offset = (input.page - 1) * input.per_page;
    const [column, order] = (input.sort?.split(".") as [
        keyof typeof hiringrooms.$inferSelect | undefined,
        "asc" | "desc" | undefined,
    ]) ?? ["createdAt", "desc"];

    const { data, total } = await db.transaction(async (tx) => {
        const hiringroomFilter = and(
            eq(hiringrooms.organizationId, currentOrg.id), // Primary filter by organization ID
            or(
                input.name
                    ? ilike(hiringrooms.name, `%${input.name}%`)
                    : undefined,
                input.status ? eq(hiringrooms.status, input.status) : undefined,
                input.ownerId
                    ? eq(hiringrooms.ownerId, input.ownerId)
                    : undefined,
            ),
        );

        const data = await tx
            .select()
            .from(hiringrooms)
            .offset(offset)
            .limit(input.per_page)
            .where(hiringroomFilter)
            .orderBy(
                column && column in hiringrooms
                    ? order === "asc"
                        ? asc(hiringrooms[column])
                        : desc(hiringrooms[column])
                    : desc(hiringrooms.createdAt),
            )
            .execute();

        const total = await tx
            .select({ count: count() })
            .from(hiringrooms)
            .where(hiringroomFilter)
            .execute()
            .then((res) => res[0]?.count ?? 0);

        return { data, total };
    });

    const pageCount = Math.ceil(total / input.per_page);

    return { data, pageCount, total };
}

export async function getPaginatedHiringroomsExcludingUserQuery(
    input: GetPaginatedHiringroomsQueryProps,
) {
    noStore();
    const { user } = await protectedProcedure();
    const { currentOrg } = await getOrganizations();

    const offset = (input.page - 1) * input.per_page;
    const [column, order] = (input.sort?.split(".") as [
        keyof typeof hiringrooms.$inferSelect | undefined,
        "asc" | "desc" | undefined,
    ]) ?? ["createdAt", "desc"];

    const { data, total } = await db.transaction(async (tx) => {
        const hiringroomFilter = and(
            eq(hiringrooms.organizationId, currentOrg.id), // Primary filter by organization ID
            ne(hiringrooms.ownerId, user.id), // Exclude hiringrooms created by the current user
            or(
                input.name
                    ? ilike(hiringrooms.name, `%${input.name}%`)
                    : undefined,
                input.status ? eq(hiringrooms.status, input.status) : undefined,
                input.ownerId
                    ? eq(hiringrooms.ownerId, input.ownerId)
                    : undefined,
            ),
        );

        const data = await tx
            .select()
            .from(hiringrooms)
            .offset(offset)
            .limit(input.per_page)
            .where(hiringroomFilter)
            .orderBy(
                column && column in hiringrooms
                    ? order === "asc"
                        ? asc(hiringrooms[column])
                        : desc(hiringrooms[column])
                    : desc(hiringrooms.createdAt),
            )
            .execute();

        const total = await tx
            .select({ count: count() })
            .from(hiringrooms)
            .where(hiringroomFilter)
            .execute()
            .then((res) => res[0]?.count ?? 0);

        return { data, total };
    });

    const pageCount = Math.ceil(total / input.per_page);

    return { data, pageCount, total };
}

export async function getHiringRoomById(roomId: string) {
    const { data } = await db.transaction(async (tx) => {
        // Use the correct way to query the `hiringrooms` table with the provided roomId
        const roomData = await tx
            .select()
            .from(hiringrooms)
            .where(eq(hiringrooms.id, roomId)) // Ensure this matches your query syntax
            .execute();

        // If the room is not found, return null or handle the case accordingly
        if (roomData.length === 0) {
            return { data: null };
        }

        return { data: roomData[0] }; // Assuming roomData is an array and we want the first match
    });

    return data;
}

export async function getSlackChannelsById(hiringRoomId: string) {
    const { data } = await db.transaction(async (tx) => {
        const slackData = await tx
            .select()
            .from(slackChannelsCreated)
            .where(eq(slackChannelsCreated.hiringroomId, hiringRoomId))
            .execute();

        // If no slack channels are found, return an empty array
        if (slackData.length === 0) {
            return { data: [] }; // Return empty array instead of null
        }

        return { data: slackData }; // Return the entire array of slack channels
    });

    return data; // Now returns an array of matching slack channels
}
