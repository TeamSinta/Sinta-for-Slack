"use server";

import { orgConfig } from "@/config/organization";
import { db } from "@/server/db";
import {
    membersToOrganizations,
    orgRequests,
    organizations,
    workflows,
} from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedures";
import { and, asc, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { cookies } from "next/headers";
import { z } from "zod";
import { unstable_noStore as noStore } from "next/cache";

export async function getUserOrgsQuery() {
    const { user } = await protectedProcedure();

    return (
        await db.query.membersToOrganizations
            .findMany({
                where: eq(membersToOrganizations.memberId, user.id),
                with: {
                    organization: true,
                },
            })
            .execute()
    ).map((mto) => ({
        ...mto.organization,
    }));
}

export async function getOrganizations() {
    const userOrgs = await getUserOrgsQuery();

    const defaultOrg = cookies().get(orgConfig.cookieName)?.value;

    const currentOrg =
        userOrgs.find((org) => org.id === defaultOrg) ?? userOrgs[0];

    return {
        currentOrg: currentOrg as typeof organizations.$inferSelect,
        userOrgs,
    };
}

export async function getOrgRequestsQuery() {
    await protectedProcedure();

    const { currentOrg } = await getOrganizations();

    return await db.query.orgRequests
        .findMany({
            where: eq(orgRequests.organizationId, currentOrg.id),
            with: {
                user: true,
            },
        })
        .execute();
}

/**
 * Check if the slack_team_id is filled for the current organization.
 * @returns A boolean indicating if the slack_team_id is set.
 */
export async function checkSlackTeamIdFilled() {
  const { currentOrg } = await getOrganizations(); // Fetch the current organization context

  if (!currentOrg) {
      return null; // Return null or any default value to indicate no organization
  }

  const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, currentOrg.id), // Properly use 'eq' for condition
      columns: {
          slack_team_id: true, // We only need to fetch the slack_team_id
      },
  });

  return org ? org.slack_team_id : null; // Return the slack_team_id or null if not found
}

/**
* Check if the greenhouse_api_token is filled for the current organization.
* @returns A boolean indicating if the greenhouse_api_token is set.
*/
export async function checkGreenhouseTeamIdFilled() {
  const { currentOrg } = await getOrganizations(); // Fetch the current organization context

  if (!currentOrg) {
      return null; // Return null or any default value to indicate no organization
  }

  const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, currentOrg.id), // Properly use 'eq' for condition
      columns: {
          greenhouse_api_token: true, // We only need to fetch the greenhouse_api_token
      },
  });

  return org ? org.greenhouse_api_token : null; // Return the greenhouse_api_token or null if not found
}

/**
* @returns A boolean indicating if there are any active workflows.
*/
export async function Checktoseeworkflows() {
  const { currentOrg } = await getOrganizations(); // Fetch the current organization context

  if (!currentOrg) {
      return false; // Return false if no organization found
  }

  const activeWorkflows = await db.query.workflows.findMany({
      where: eq(workflows.organizationId, currentOrg.id), // Properly use 'eq' for condition
      columns: {
          id: true, // We only need to check if there's at least one workflow
      },
  });

  return activeWorkflows.length > 0; // Return true if there's at least one workflow, false otherwise
}

/**
* Fetch the first 5 workflows for the current organization.
* @returns An array of workflows with their names.
*/
export async function getFirstFiveWorkflows() {
  const { currentOrg } = await getOrganizations(); // Fetch the current organization context

  if (!currentOrg) {
      return []; // Return an empty array if no organization found
  }

  const workflowFilter = eq(workflows.organizationId, currentOrg.id);

  const workflowsList = await db.query.workflows.findMany({
      where: workflowFilter, // Apply the filter
      columns: {
          name: true, // Fetch the name of the workflows
      },
      limit: 5, // Limit to the first 5 workflows
      orderBy: desc(workflows.createdAt), // Order by creation date, descending
  });

  return workflowsList;
}

/**
 * @purpose Get organization by id
 * @param orgId
 * @returns organization
 */

type GetOrgByIdProps = {
    orgId: string;
};

export async function getOrgByIdQuery({ orgId }: GetOrgByIdProps) {
    await protectedProcedure();

    return await db.query.organizations.findFirst({
        where: and(eq(organizations.id, orgId)),
        columns: {
            name: true,
            image: true,
        },
    });
}

/**
 * @purpose Get paginated users
 * @param page - page number
 * @param per_page - number of items per page
 * @param sort - sort by column
 * @param email - filter by email
 * @param role - filter by role
 * @param operator - filter by operator
 * @returns Paginated users
 */

const panginatedUserPropsSchema = z.object({
    page: z.coerce.number().default(1),
    per_page: z.coerce.number().default(10),
    sort: z.string().optional(),
    email: z.string().optional(),
    role: z.string().optional(),
    operator: z.string().optional(),
});

type GetPaginatedUsersQueryProps = z.infer<typeof panginatedUserPropsSchema>;

export async function getPaginatedOrgMembersQuery(
    input: GetPaginatedUsersQueryProps,
) {
    const { currentOrg } = await getOrganizations();

    noStore();
    const offset = (input.page - 1) * input.per_page;

    const [column, order] = (input.sort?.split(".") as [
        keyof typeof membersToOrganizations.$inferSelect | undefined,
        "asc" | "desc" | undefined,
    ]) ?? ["title", "desc"];

    const roles =
        (input.role?.split(
            ".",
        ) as (typeof membersToOrganizations.$inferSelect.role)[]) ?? [];

    const { data, total } = await db.transaction(async (tx) => {
        const data = await tx.query.membersToOrganizations.findMany({
            offset,
            limit: input.per_page,
            where: and(
                eq(membersToOrganizations.organizationId, currentOrg.id),
                or(
                    input.email
                        ? ilike(
                              membersToOrganizations.memberEmail,
                              `%${input.email}%`,
                          )
                        : undefined,

                    roles.length > 0
                        ? inArray(membersToOrganizations.role, roles)
                        : undefined,
                ),
            ),
            with: {
                member: {
                    columns: {
                        id: true,
                        email: true,
                        image: true,
                        name: true,
                    },
                },
            },
            orderBy:
                column && column in membersToOrganizations
                    ? order === "asc"
                        ? asc(membersToOrganizations[column])
                        : desc(membersToOrganizations[column])
                    : desc(membersToOrganizations.createdAt),
        });

        const total = await tx
            .select({
                count: count(),
            })
            .from(membersToOrganizations)
            .where(
                and(
                    eq(membersToOrganizations.organizationId, currentOrg.id),
                    or(
                        input.email
                            ? ilike(
                                  membersToOrganizations.memberEmail,
                                  `%${input.email}%`,
                              )
                            : undefined,

                        roles.length > 0
                            ? inArray(membersToOrganizations.role, roles)
                            : undefined,
                    ),
                ),
            )
            .execute()
            .then((res) => res[0]?.count ?? 0);

        return { data, total };
    });

    const pageCount = Math.ceil(total / input.per_page);

    return { data, pageCount, total };
}

export async function getSubdomainByWorkflowID(
    workflowId: string,
): Promise<string> {
    if (!workflowId) {
        throw new Error("No workflow ID provided.");
    }

    // Fetch workflow details using the provided workflow ID
    const workflow = await db.query.workflows.findFirst({
        where: eq(workflows.id, workflowId),
        columns: {
            organizationId: true,
        },
    });

    if (!workflow) {
        throw new Error("Workflow not found.");
    }

    // Fetch organization's subdomain using the organization ID from the workflow
    const organization = await db.query.organizations.findFirst({
        where: eq(organizations.id, workflow.organizationId),
        columns: {
            greenhouse_subdomain: true,
        },
    });

    if (!organization) {
        throw new Error("Organization not found.");
    }

    return organization.greenhouse_subdomain!;
}
