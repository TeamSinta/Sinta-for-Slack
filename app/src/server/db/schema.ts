import { relations, sql } from "drizzle-orm";
import {
    boolean,
    index,
    integer,
    jsonb,
    pgEnum,
    pgTableCreator,
    primaryKey,
    text,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator(
    (name) => `teamsinta-saas-starterkit_${name}`,
);

export const usersRoleEnum = pgEnum("role", ["User", "Admin", "Super Admin"]);
export const workflowStatusEnum = pgEnum("workflow_status", [
    "Active",
    "Inactive",
    "Archived",
]);
export const hiringroomStatusEnum = pgEnum("hiringroom_status", [
    "Active",
    "Inactive",
    "Archived",
]);
export const slackChannelsCreatedStatusEnum = pgEnum(
    "slack_channels_created_status",
    ["Active", "Inactive", "Archived"],
);
export const assignmentStatusEnum = pgEnum("assignment_status", [
    "Active",
    "Inactive",
    "Archived",
]);

// slack_channels_created table definition
export const slackChannelsCreated = createTable("slack_channels_created", {
    id: varchar("id", { length: 255 })
        .notNull()
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    channelId: varchar("channelId", { length: 255 }).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    createdBy: varchar("createdBy", { length: 255 }),
    description: varchar("description", { length: 255 }),
    greenhouseCandidateId: varchar("greenhouseCandidateId", { length: 255 }),
    greenhouseJobId: varchar("greenhouseJobId", { length: 255 }),
    isArchived: boolean("isArchived").default(false).notNull(),
    invitedUsers: jsonb("invited_users")
        .notNull()
        .default(sql`'[]'`),
    hiringroomId: varchar("hiringroomId", { length: 255 }), // Ensure this is not commented
    channelFormat: varchar("channelFormat", { length: 255 }).notNull(),
    organizationId: varchar("organizationId", { length: 255 })
        .notNull()
        .references(() => organizations.id, { onDelete: "cascade" }),
});

export const hiringrooms = createTable("hiringroom", {
    id: varchar("id", { length: 255 })
        .notNull()
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    objectField: varchar("objectField", { length: 255 }).notNull(),
    alertType: varchar("alertType", { length: 255 }),
    conditions: jsonb("conditions").notNull(), // Updated to JSONB
    triggerConfig: jsonb("trigger_config").notNull(), // Added trigger_config as JSONB
    recipient: jsonb("recipient").notNull(),
    actions: jsonb("actions"),
    slackChannelFormat: varchar("slackChannelFormat", { length: 255 }), // Added slackChannelFormat field
    status: hiringroomStatusEnum("status").default("Active").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    modifiedAt: timestamp("modifiedAt", { mode: "date" }),
    ownerId: varchar("ownerId", { length: 255 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    organizationId: varchar("organizationId", { length: 255 })
        .notNull()
        .references(() => organizations.id, { onDelete: "cascade" }),
});

export const workflows = createTable("workflow", {
    id: varchar("id", { length: 255 })
        .notNull()
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    objectField: varchar("objectField", { length: 255 }).notNull(),
    alertType: varchar("alertType", { length: 255 }).notNull(),
    conditions: jsonb("conditions").notNull(), // Updated to JSONB
    triggerConfig: jsonb("trigger_config").notNull(), // Added trigger_config as JSONB
    recipient: jsonb("recipient").notNull(),
    status: workflowStatusEnum("status").default("Active").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    modifiedAt: timestamp("modifiedAt", { mode: "date" }),
    ownerId: varchar("ownerId", { length: 255 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    organizationId: varchar("organizationId", { length: 255 })
        .notNull()
        .references(() => organizations.id, { onDelete: "cascade" }),
});

export const workflowsRelations = relations(workflows, ({ one }) => ({
    owner: one(users, {
        fields: [workflows.ownerId],
        references: [users.id],
    }),
    organization: one(organizations, {
        fields: [workflows.organizationId],
        references: [organizations.id],
    }),
}));

export const hiringroomsRelations = relations(hiringrooms, ({ one, many }) => ({
    owner: one(users, {
        fields: [hiringrooms.ownerId],
        references: [users.id],
    }),
    organization: one(organizations, {
        fields: [hiringrooms.organizationId],
        references: [organizations.id],
    }),
    // slackChannelsCreated: many(slackChannelsCreated),
    // slackChannelsCreated: many(slackChannelsCreated, {
    //     fields: [slackChannelsCreated.hiringroomId],
    //     references: [hiringrooms.id],
    // }),
}));

// export const slackChannelsCreatedRelations = relations(slackChannelsCreated, ({ one }) => ({
//     hiringroom: one(hiringrooms, {
//         fields: [slackChannelsCreated.hiringroomId],
//         references: [hiringrooms.id],
//     }),
// }));
export const workflowInsertSchema = createInsertSchema(workflows, {
    name: z
        .string()
        .min(3, "Workflow name must be at least 3 characters long")
        .max(50, "Workflow name must be at most 50 characters long"),
    objectField: z.string().min(1, "Object field must not be empty"),
    alertType: z.string().min(1, "Alert type must not be empty"),
});

export const hiringroomInsertSchema = createInsertSchema(hiringrooms, {
    name: z
        .string()
        .min(3, "Hiringroom name must be at least 3 characters long")
        .max(50, "Hiringroom name must be at most 50 characters long"),
    objectField: z.string().min(1, "Object field must not be empty"),
    alertType: z.string().min(1, "Alert type must not be empty"),
});

export const workflowSelectSchema = createSelectSchema(workflows, {
    name: z
        .string()
        .min(3, "Workflow name must be at least 3 characters long")
        .max(50, "Workflow name must be at most 50 characters long"),
});
export const hiringroomSelectSchema = createSelectSchema(hiringrooms, {
    name: z
        .string()
        .min(3, "Hiringroom name must be at least 3 characters long")
        .max(50, "Hiringroom name must be at most 50 characters long"),
});

export const users = createTable("user", {
    id: varchar("id", { length: 255 }).notNull().primaryKey(),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull(),
    emailVerified: timestamp("emailVerified", {
        mode: "date",
    }).default(sql`CURRENT_TIMESTAMP`),
    image: varchar("image", { length: 255 }),
    role: usersRoleEnum("role").default("User").notNull(),
    isNewUser: boolean("isNewUser").default(true).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
    accounts: many(accounts),
    membersToOrganizations: many(membersToOrganizations),
    feedback: many(feedback),
}));

export const userInsertSchema = createInsertSchema(users, {
    name: z
        .string()
        .trim()
        .min(3, "Name must be at least 3 characters long")
        .max(50, "Name must be at most 50 characters long"),
    email: z.string().email(),
    image: z.string().url(),
});

export const accounts = createTable(
    "account",
    {
        userId: varchar("userId", { length: 255 })
            .notNull()
            .references(() => users.id),
        type: varchar("type", { length: 255 })
            .$type<AdapterAccount["type"]>()
            .notNull(),
        provider: varchar("provider", { length: 255 }).notNull(),
        providerAccountId: varchar("providerAccountId", {
            length: 255,
        }).notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: varchar("token_type", { length: 255 }),
        scope: varchar("scope", { length: 255 }),
        id_token: text("id_token"),
        session_state: varchar("session_state", { length: 255 }),
    },
    (account) => ({
        compoundKey: primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
        userIdIdx: index("account_userId_idx").on(account.userId),
    }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
    user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
    "session",
    {
        sessionToken: varchar("sessionToken", { length: 255 })
            .notNull()
            .primaryKey(),
        userId: varchar("userId", { length: 255 })
            .notNull()
            .references(() => users.id),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (session) => ({
        userIdIdx: index("session_userId_idx").on(session.userId),
    }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
    "verificationToken",
    {
        identifier: varchar("identifier", { length: 255 }).notNull(),
        token: varchar("token", { length: 255 }).notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (vt) => ({
        compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
    }),
);

export const organizations = createTable("organization", {
    id: varchar("id", { length: 255 })
        .notNull()
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    image: varchar("image", { length: 255 }),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    ownerId: varchar("ownerId", { length: 255 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    slack_team_id: varchar("slack_team_id", { length: 255 }),
    slack_access_token: varchar("slack_access_token", { length: 1024 }),
    slack_refresh_token: varchar("slack_refresh_token", { length: 1024 }),
    token_expiry: integer("token_expiry"), // Stores UNIX timestamp of token expiry
    incoming_webhook_url: varchar("incoming_webhook_url", { length: 1024 }),
    greenhouse_api_token: varchar("greenhouse_api_token", { length: 255 }),
    greenhouse_subdomain: varchar("greenhouse_subdomain", { length: 255 }), // New column
    greenhouse_secret_key: varchar("greenhouse_secret_key", { length: 255 }), // New column
});

export const organizationsInsertSchema = createInsertSchema(organizations);

export const createOrgInsertSchema = createInsertSchema(organizations, {
    name: z
        .string()
        .min(3, "Name must be at least 3 characters long")
        .max(50, "Name must be at most 50 characters long"),
    image: z.string().url({ message: "Invalid image URL" }),
});

export const organizationsRelations = relations(
    organizations,
    ({ one, many }) => ({
        owner: one(users, {
            fields: [organizations.ownerId],
            references: [users.id],
        }),
        membersToOrganizations: many(membersToOrganizations),
    }),
);

export const membersToOrganizationsRoleEnum = pgEnum("org_member_role", [
    "Interviewer",
    "Recruiter",
    "Hiring Manager",
    "Admin"
]);

export const membersToOrganizations = createTable(
    "membersToOrganizations",
    {
        id: varchar("id", { length: 255 }).default(sql`gen_random_uuid()`),
        memberId: varchar("memberId", { length: 255 })
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        memberEmail: varchar("memberEmail", { length: 255 }).notNull(),
        organizationId: varchar("organizationId", { length: 255 })
            .notNull()
            .references(() => organizations.id, { onDelete: "cascade" }),
        role: membersToOrganizationsRoleEnum("role")
            .default("Interviewer")
            .notNull(),
        slack_user_id: varchar("slack_user_id", { length: 255 }), // New column
        createdAt: timestamp("createdAt", { mode: "date" })
            .notNull()
            .defaultNow(),
    },
    (mto) => ({
        compoundKey: primaryKey({
            columns: [mto.id, mto.memberId, mto.organizationId],
        }),
    }),
);

export const membersToOrganizationsRelations = relations(
    membersToOrganizations,
    ({ one }) => ({
        member: one(users, {
            fields: [membersToOrganizations.memberId],
            references: [users.id],
        }),
        organization: one(organizations, {
            fields: [membersToOrganizations.organizationId],
            references: [organizations.id],
        }),
    }),
);

export const membersToOrganizationsInsertSchema = createInsertSchema(
    membersToOrganizations,
);

export const userPreferences = createTable("user_preferences", {
    id: varchar("id", { length: 255 })
        .notNull()
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    userId: varchar("userId", { length: 255 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    organizationId: varchar("organizationId", { length: 255 })
        .notNull()
        .references(() => organizations.id, { onDelete: "cascade" }),
    role: membersToOrganizationsRoleEnum("role").notNull(),
    upcomingInterviews: boolean("upcomingInterviews").default(false).notNull(),
    pendingFeedback: boolean("pendingFeedback").default(false).notNull(),
    videoConferenceLink: boolean("videoConferenceLink")
        .default(false)
        .notNull(),
    resources: jsonb("resources")
        .default(sql`'[]'`)
        .notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const userPreferencesInsertSchema = createInsertSchema(userPreferences, {
    userId: z.string().uuid(),
    organizationId: z.string().uuid(),
    role: z.enum(["Interviewer", "Recruiter", "Hiring Manager"]),
    upcomingInterviews: z.boolean().default(true),
    pendingFeedback: z.boolean().default(true),
    videoConferenceLink: z.boolean().default(true),
    resources: z
        .array(
            z.object({
                label: z.string().min(1),
                link: z.string().url(),
            }),
        )
        .default([]),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export const orgRequests = createTable(
    "orgRequest",
    {
        id: varchar("id", { length: 255 })
            .notNull()
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        userId: varchar("userId", { length: 255 })
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),

        organizationId: varchar("organizationId", {
            length: 255,
        })
            .notNull()
            .references(() => organizations.id, { onDelete: "cascade" }),
        createdAt: timestamp("createdAt", { mode: "date" })
            .notNull()
            .defaultNow(),
    },
    (or) => ({
        orgIdIdx: index("orgRequest_organizationId_idx").on(or.organizationId),
    }),
);

export const orgRequestsRelations = relations(orgRequests, ({ one }) => ({
    user: one(users, { fields: [orgRequests.userId], references: [users.id] }),
    organization: one(organizations, {
        fields: [orgRequests.organizationId],
        references: [organizations.id],
    }),
}));

export const orgRequestInsertSchema = createInsertSchema(orgRequests);

// Feedback schema

export const feedbackLabelEnum = pgEnum("feedback-label", [
    "Issue",
    "Idea",
    "Question",
    "Complaint",
    "Feature Request",
    "Other",
]);

export const feedbackStatusEnum = pgEnum("feedback-status", [
    "Open",
    "In Progress",
    "Closed",
]);

export const feedback = createTable("feedback", {
    id: varchar("id", { length: 255 })
        .notNull()
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    userId: varchar("userId", { length: 255 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }),
    message: text("message").notNull(),
    label: feedbackLabelEnum("label").notNull(),
    status: feedbackStatusEnum("status").default("Open").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const feedbackRelations = relations(feedback, ({ one }) => ({
    user: one(users, { fields: [feedback.userId], references: [users.id] }),
}));

export const feedbackInsertSchema = createInsertSchema(feedback, {
    title: z
        .string()
        .min(3, "Title is too short")
        .max(255, "Title is too long"),
    message: z
        .string()
        .min(10, "Message is too short")
        .max(1000, "Message is too long"),
});

export const feedbackSelectSchema = createSelectSchema(feedback, {
    title: z
        .string()
        .min(3, "Title is too short")
        .max(255, "Title is too long"),
    message: z
        .string()
        .min(10, "Message is too short")
        .max(1000, "Message is too long"),
});
