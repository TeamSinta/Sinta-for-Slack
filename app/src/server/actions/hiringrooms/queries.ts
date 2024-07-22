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
    const { data } = await db.transaction(async (tx) => {
        const data = await tx.select().from(slackChannelsCreated).execute();

        return { data };
    });

    return data;
}
const slackChannelsCreatedStatusSchema = z.enum(["Active", "Inactive", "Archived"]);

// id: varchar("id", { length: 255 })
// .notNull()
// .primaryKey()
// .default(sql`gen_random_uuid()`),
// name: varchar("name", { length: 255 }).notNull(),
// channelId: varchar("channelId", { length: 255 }).notNull(),
// createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
// createdBy: varchar("createdBy", { length: 255 }),
// description: varchar("description", { length: 255 }),
// greenhouseCandidateId: varchar("greenhouseCandidateId", { length: 255 }),
// greenhouseJobId: varchar("greenhouseJobId", { length: 255 }),
// isArchived: boolean("isArchived").default(false).notNull(),
// invitedUsers: jsonb("invited_users").notNull().default(sql`'[]'`),
// // hiringroomId: varchar("hiringroomId", { length: 255 }),
// // .references(() => hiringrooms.id, { onDelete: "cascade" }),
// channelFormat: varc
const paginatedSlackChannelCreatedPropsSchema = z.object({
    page: z.coerce.number().default(1),
    per_page: z.coerce.number().default(10),
    sort: z.string().optional(),
    name: z.string().optional(),
    status: slackChannelsCreatedStatusSchema.optional(), // Use Zod enum for validation
    ownerId: z.string().optional(),
    isArchived: z.boolean().optional()
});

type GetPaginatedSlackChannelCreatedQueryProps = z.infer<
    typeof paginatedSlackChannelCreatedPropsSchema
>;
export async function getSlackChannelsCreatedPromise(
    input: GetPaginatedSlackChannelCreatedQueryProps,
) {
    console.log('input - ',input)
    const { currentOrg } = await getOrganizations();

    const offset = (input.page - 1) * input.per_page;
    const [column, order] = (input.sort?.split(".") as [
        keyof typeof slackChannelsCreated.$inferSelect | undefined,
        "asc" | "desc" | undefined,
    ]) ?? ["createdAt", "desc"];

    const { data, total } = await db.transaction(async (tx) => {
        // const slackChannelsCreatedFilter = and(
            // eq(slackChannelsCreated.organizationId, currentOrg.id), // Primary filter by organization ID
            // or(
            //     input.name
            //         ? ilike(hiringrooms.name, `%${input.name}%`)
            //         : undefined,
            //     input.status ? eq(hiringrooms.status, input.status) : undefined,
            //     input.ownerId
            //         ? eq(hiringrooms.ownerId, input.ownerId)
            //         : undefined,
            // ),
        // );

        const data = await tx
            .select()
            .from(slackChannelsCreated)
            .offset(offset)
            .limit(input.per_page)
            // .where(slackChannelsCreatedFilter)
            .orderBy(
                column && column in slackChannelsCreated
                    ? order === "asc"
                        ? asc(slackChannelsCreated[column])
                        : desc(slackChannelsCreated[column])
                    : desc(slackChannelsCreated.createdAt),
            )
            .execute();
            // console.log('data post in db - ',data)
        const total = await tx
            .select({ count: count() })
            .from(slackChannelsCreated)
            // .where(slackChannelsCreatedFilter)
            .execute()
            .then((res) => res[0]?.count ?? 0);
            // console.log('DATA - DATA - ',data)
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
