"use server";

import { db } from "@/server/db";
import { hiringrooms } from "@/server/db/schema"; // Assuming HiringRoomStatus is the enum type for status
import { asc, desc, eq, count, and, ilike, or, ne } from "drizzle-orm";
import { z } from "zod";
import { unstable_noStore as noStore } from "next/cache";
import { protectedProcedure } from "@/server/procedures";
import { getOrganizations } from "../organization/queries";

// Define a Zod schema with the specific enum values
const hiringroomStatusSchema = z.enum(["Active", "Inactive", "Archived"]);

const paginatedHiringRoomPropsSchema = z.object({
    page: z.coerce.number().default(1),
    per_page: z.coerce.number().default(10),
    sort: z.string().optional(),
    name: z.string().optional(),
    status: hiringroomStatusSchema.optional(), // Use Zod enum for validation
    ownerId: z.string().optional(),
});

type GetPaginatedHiringRoomsQueryProps = z.infer<
    typeof paginatedHiringRoomPropsSchema
>;

export async function getHiringRooms() {
    const { data } = await db.transaction(async (tx) => {
        const data = await tx.select().from(hiringrooms).execute();

        return { data };
    });

    return data;
}
export async function getPaginatedHiringRoomsQuery(
    input: GetPaginatedHiringRoomsQueryProps,
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

export async function getPaginatedHiringRoomsByOrgQuery(
    input: GetPaginatedHiringRoomsQueryProps,
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

export async function getPaginatedHiringRoomsExcludingUserQuery(
    input: GetPaginatedHiringRoomsQueryProps,
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
