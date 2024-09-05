// @ts-nocheck

"use server";

import { db } from "@/server/db";
import {
    createOrgInsertSchema,
    membersToOrganizations,
    membersToOrganizationsInsertSchema,
    orgRequestInsertSchema,
    orgRequests,
    organizations,
    userPreferences,
    userPreferencesInsertSchema,
} from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedures";
import { and, eq } from "drizzle-orm";
import { getOrganizations } from "@/server/actions/organization/queries";
import { z } from "zod";
import MixpanelServer from "@/server/mixpanel";

/**
 * Create a new organization mutations
 * @param name - Name of the organization
 * @param image - Image URL of the organization
 * @returns The created organization
 */

type CreateOrgProps = Omit<typeof organizations.$inferInsert, "id" | "ownerId">;

export async function createOrgMutation({ ...props }: CreateOrgProps) {
    const { user } = await protectedProcedure();

    const organizationParse = await createOrgInsertSchema.safeParseAsync({
        ownerId: user.id,
        ...props,
    });

    if (!organizationParse.success) {
        throw new Error("Invalid organization data", {
            cause: organizationParse.error.errors,
        });
    }

    const createOrg = await db
        .insert(organizations)
        .values(organizationParse.data)
        .returning()
        .execute();

    await db.insert(membersToOrganizations).values({
        memberId: organizationParse.data.ownerId,
        memberEmail: user.email!,
        organizationId: createOrg[0]!.id,
        role: "Admin",
        slack_user_id: null,
    });

    MixpanelServer.track("Organization Created", {
        organization_id: createOrg[0]!.id,
        organization_name: organizationParse.data.name,
        org_created_at: new Date(),
    });
    return createOrg[0];
}

/**
 * Update the name of the organization
 * @param name - New name of the organization
 * @returns The updated organization
 */

const updateOrgNameSchema = createOrgInsertSchema.pick({
    name: true,
});

type UpdateOrgNameProps = z.infer<typeof updateOrgNameSchema>;

export async function updateOrgNameMutation({ name }: UpdateOrgNameProps) {
    const { user } = await protectedProcedure();

    const { currentOrg } = await getOrganizations();

    const organizationNameParse = await updateOrgNameSchema.safeParseAsync({
        name,
    });

    if (!organizationNameParse.success) {
        throw new Error("Invalid organization data", {
            cause: organizationNameParse.error.errors,
        });
    }

    const memToOrg = await db.query.membersToOrganizations.findFirst({
        where: and(
            eq(membersToOrganizations.memberId, user.id),
            eq(membersToOrganizations.organizationId, currentOrg.id),
            eq(membersToOrganizations.role, "Admin"),
        ),
    });

    if (currentOrg.ownerId === user.id || memToOrg) {
        return await db
            .update(organizations)
            .set({ name: organizationNameParse.data.name })
            .where(eq(organizations.id, currentOrg.id))
            .execute();
    }

    throw new Error("You are not an admin of this organization");
}

/**
 * Update the image of the organization
 * @param image - New image URL of the organization
 * @returns The updated organization
 */

const updateOrgImageSchema = createOrgInsertSchema.pick({
    image: true,
});

type UpdateOrgImageProps = z.infer<typeof updateOrgImageSchema>;

export async function updateOrgImageMutation({ image }: UpdateOrgImageProps) {
    const { user } = await protectedProcedure();

    const { currentOrg } = await getOrganizations();

    const organizationImageParse = await updateOrgImageSchema.safeParseAsync({
        image,
    });

    if (!organizationImageParse.success) {
        throw new Error("Invalid organization data", {
            cause: organizationImageParse.error.errors,
        });
    }

    const memToOrg = await db.query.membersToOrganizations.findFirst({
        where: and(
            eq(membersToOrganizations.memberId, user.id),
            eq(membersToOrganizations.organizationId, currentOrg.id),
            eq(membersToOrganizations.role, "Admin"),
        ),
    });

    if (currentOrg.ownerId === user.id || memToOrg) {
        return await db
            .update(organizations)
            .set({ image: organizationImageParse.data.image })
            .where(eq(organizations.id, currentOrg.id))
            .execute();
    }

    throw new Error("You are not an admin of this organization");
}

/**
 * Delete the organization
 * @returns The deleted organization
 */

export async function deleteOrgMutation() {
    const { user } = await protectedProcedure();

    const { currentOrg } = await getOrganizations();

    if (currentOrg.ownerId !== user.id) {
        throw new Error("You are not the owner of this organization");
    }

    MixpanelServer.track("Organization Deleted", {
        organiztion_id: currentOrg.id,
        organization_name: currentOrg.name,
    });
    return await db
        .delete(organizations)
        .where(eq(organizations.id, currentOrg.id))
        .execute();
}

/**
 * Send a request to join an organization
 * @param orgId - ID of the organization
 */

type OrgRequestProps = {
    orgId: typeof orgRequestInsertSchema._type.organizationId;
};

export async function sendOrgRequestMutation({ orgId }: OrgRequestProps) {
    const { user } = await protectedProcedure();

    const orgRequestParse = await orgRequestInsertSchema.safeParseAsync({
        organizationId: orgId,
        userId: user.id,
    });

    if (!orgRequestParse.success) {
        throw new Error("Invalid organization data", {
            cause: orgRequestParse.error.errors,
        });
    }

    return await db
        .insert(orgRequests)
        .values({
            organizationId: orgRequestParse.data.organizationId,
            userId: orgRequestParse.data.userId,
        })
        .onConflictDoNothing({
            where: and(
                eq(orgRequests.organizationId, orgId),
                eq(orgRequests.userId, user.id),
            ),
        })
        .execute();
}

/**
 * Accept a request to join an organization
 * @param requestId - ID of the request
 */

const acceptOrgRequestSchema = z.object({
    requestId: z.string(),
});

type AcceptOrgRequestProps = z.infer<typeof acceptOrgRequestSchema>;

export async function acceptOrgRequestMutation({
    requestId,
}: AcceptOrgRequestProps) {
    const { user } = await protectedProcedure();

    const { currentOrg } = await getOrganizations();

    const acceptReqParse = await acceptOrgRequestSchema.safeParseAsync({
        requestId,
    });

    if (!acceptReqParse.success) {
        throw new Error("Invalid request data", {
            cause: acceptReqParse.error.errors,
        });
    }

    const memToOrg = await db.query.membersToOrganizations.findFirst({
        where: and(
            eq(membersToOrganizations.memberId, user.id),
            eq(membersToOrganizations.organizationId, currentOrg.id),
            eq(membersToOrganizations.role, "Admin"),
        ),
    });

    if (currentOrg.ownerId === user.id || memToOrg) {
        const request = await db.query.orgRequests.findFirst({
            where: eq(orgRequests.id, acceptReqParse.data.requestId),
            with: {
                user: true,
            },
        });

        if (!request) {
            throw new Error("Request not found");
        }

        await db.insert(membersToOrganizations).values({
            memberId: request.userId,
            organizationId: currentOrg.id,
            memberEmail: request.user.email,
        });

        return await db
            .delete(orgRequests)
            .where(eq(orgRequests.id, acceptReqParse.data.requestId))
            .execute();
    }

    throw new Error("You are not an admin of this organization");
}

/**
 * Decline a request to join an organization
 * @param requestId - ID of the request
 */

const declineOrgRequestSchema = z.object({
    requestId: z.string(),
});

type DeclineOrgRequestProps = z.infer<typeof declineOrgRequestSchema>;

export async function declineOrgRequestMutation({
    requestId,
}: DeclineOrgRequestProps) {
    const { user } = await protectedProcedure();

    const { currentOrg } = await getOrganizations();

    const declineReqParse = await declineOrgRequestSchema.safeParseAsync({
        requestId,
    });

    if (!declineReqParse.success) {
        throw new Error("Invalid request data", {
            cause: declineReqParse.error.errors,
        });
    }

    const memToOrg = await db.query.membersToOrganizations.findFirst({
        where: and(
            eq(membersToOrganizations.memberId, user.id),
            eq(membersToOrganizations.organizationId, currentOrg.id),
            eq(membersToOrganizations.role, "Admin"),
        ),
    });

    if (currentOrg.ownerId === user.id || memToOrg) {
        return await db
            .delete(orgRequests)
            .where(eq(orgRequests.id, declineReqParse.data.requestId))
            .execute();
    }

    throw new Error("You are not an admin of this organization");
}

/**
 * Update Member Role
 * @param memberId - Member's id which you want to update
 * @param role - The Role you want to update
 */

const updateMemberRoleSchema = membersToOrganizationsInsertSchema.pick({
    role: true,
    memberId: true,
});

type UpdateMemberRoleProps = z.infer<typeof updateMemberRoleSchema>;

export async function updateMemberRoleMutation({
    memberId,
    role,
}: UpdateMemberRoleProps) {
    const { user } = await protectedProcedure();

    const { currentOrg } = await getOrganizations();

    const updateMemberRoleParse = await updateMemberRoleSchema.safeParseAsync({
        memberId,
        role,
    });

    if (!updateMemberRoleParse.success) {
        throw new Error("Invalid update member data", {
            cause: updateMemberRoleParse.error.errors,
        });
    }

    const memToOrg = await db.query.membersToOrganizations.findFirst({
        where: and(
            eq(membersToOrganizations.memberId, user.id),
            eq(membersToOrganizations.organizationId, currentOrg.id),
            eq(membersToOrganizations.role, "Admin"),
        ),
    });

    if (
        updateMemberRoleParse.data.role === "Admin" &&
        currentOrg.ownerId !== user.id
    ) {
        throw new Error("You are not the owner of this organization");
    }

    if (currentOrg.ownerId === user.id || memToOrg) {
        return await db
            .update(membersToOrganizations)
            .set({ role: updateMemberRoleParse.data.role })
            .where(
                and(
                    eq(
                        membersToOrganizations.memberId,
                        updateMemberRoleParse.data.memberId,
                    ),
                    eq(membersToOrganizations.organizationId, currentOrg.id),
                ),
            )
            .execute();
    }

    throw new Error("You are not an admin of this organization");
}

/**
 * Remove User from org
 * @param userId - the id of user your want to remove
 */

const removeUserSchema = membersToOrganizationsInsertSchema.pick({
    memberId: true,
});

type RemoveUserProps = z.infer<typeof removeUserSchema>;

export async function removeUserMutation({ memberId }: RemoveUserProps) {
    const { user } = await protectedProcedure();
    const { currentOrg } = await getOrganizations();
    const removeUserParse = await removeUserSchema.safeParseAsync({
        memberId,
    });
    if (!removeUserParse.success) {
        throw new Error("Invalid remove user data", {
            cause: removeUserParse.error.errors,
        });
    }
    if (currentOrg.ownerId === removeUserParse.data.memberId) {
        throw new Error("You can't remove the owner of the organization");
    }
    const memToOrg = await db.query.membersToOrganizations.findFirst({
        where: and(
            eq(membersToOrganizations.memberId, user.id),
            eq(membersToOrganizations.organizationId, currentOrg.id),
            eq(membersToOrganizations.role, "Admin"),
        ),
    });
    if (currentOrg.ownerId === user.id || memToOrg) {
        const result = await db
            .delete(membersToOrganizations)
            .where(
                and(
                    eq(
                        membersToOrganizations.memberId,
                        removeUserParse.data.memberId,
                    ),
                    eq(membersToOrganizations.organizationId, currentOrg.id),
                ),
            )
            .execute();
        return result;
    }
    throw new Error("You are not an admin of this organization");
}

/**
 * Save or Update User Preferences
 * @param userId - The ID of the user
 * @param organizationId - The ID of the organization
 * @param role - The role of the user (Interviewer, Recruiter, Hiring Manager)
 * @param preferences - The user's preferences to be saved
 * @returns The saved or updated preferences
 */
type SaveUserPreferencesProps = Omit<typeof userPreferences.$inferInsert, "id">;

export async function saveUserPreferencesMutation({
    ...props
}: SaveUserPreferencesProps) {
    const { user } = await protectedProcedure();
    const { currentOrg } = await getOrganizations(); // Get the current organization context

    if (!currentOrg) {
        throw new Error("No organization found for the current user.");
    }

    // Construct the full preferences object including userId and organizationId
    const preferencesData = {
        ...props,
        userId: user.id, // Use the authenticated user's ID
        organizationId: currentOrg.id, // Use the current organization ID
    };

    // Validate the input data
    const preferencesParse =
        await userPreferencesInsertSchema.safeParseAsync(preferencesData);

    if (!preferencesParse.success) {
        throw new Error("Invalid preferences data", {
            cause: preferencesParse.error.errors,
        });
    }

    // Check if preferences already exist for this user, organization, and role
    const existingPref = await db.query.userPreferences.findFirst({
        where: and(
            eq(userPreferences.userId, user.id),
            eq(userPreferences.organizationId, currentOrg.id),
            eq(userPreferences.role, preferencesParse.data.role),
        ),
    });

    if (existingPref) {
        // Update the existing preferences
        const updatedPref = await db
            .update(userPreferences)
            .set({
                upcomingInterviews: preferencesParse.data.upcomingInterviews,
                pendingFeedback: preferencesParse.data.pendingFeedback,
                videoConferenceLink: preferencesParse.data.videoConferenceLink,
                resources: preferencesParse.data.resources,
                updatedAt: new Date(),
            })
            .where(eq(userPreferences.id, existingPref.id))
            .returning()
            .execute();

        return updatedPref[0];
    } else {
        // Insert new preferences
        const newPref = await db
            .insert(userPreferences)
            .values({
                ...preferencesParse.data,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning()
            .execute();

        return newPref[0];
    }
}
