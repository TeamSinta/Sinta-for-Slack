DO $$ BEGIN
 CREATE TYPE "public"."assignment_status" AS ENUM('Active', 'Inactive', 'Archived');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."hiringroom_status" AS ENUM('Active', 'Inactive', 'Archived');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."slack_channels_created_status" AS ENUM('Active', 'Inactive', 'Archived');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TYPE "org-member-role" ADD VALUE 'Interviewer';--> statement-breakpoint
ALTER TYPE "org-member-role" ADD VALUE 'Recruiter';--> statement-breakpoint
ALTER TYPE "org-member-role" ADD VALUE 'Hiring Manager';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teamsinta-saas-starterkit_hiringroom" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"objectField" varchar(255) NOT NULL,
	"alertType" varchar(255),
	"conditions" jsonb NOT NULL,
	"trigger_config" jsonb NOT NULL,
	"recipient" jsonb NOT NULL,
	"status" "hiringroom_status" DEFAULT 'Active' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"modifiedAt" timestamp,
	"slackChannelFormat" varchar(255),
	"ownerId" varchar(255) NOT NULL,
	"organizationId" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teamsinta-saas-starterkit_slack_channels_created" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"channelId" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"createdBy" varchar(255),
	"description" varchar(255),
	"greenhouseCandidateId" varchar(255),
	"greenhouseJobId" varchar(255),
	"isArchived" boolean DEFAULT false NOT NULL,
	"invited_users" jsonb DEFAULT '[]' NOT NULL,
	"hiringroomId" varchar(255),
	"channelFormat" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teamsinta-saas-starterkit_user_preferences" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" varchar(255) NOT NULL,
	"organizationId" varchar(255) NOT NULL,
	"role" "org-member-role" NOT NULL,
	"upcomingInterviews" boolean DEFAULT false NOT NULL,
	"pendingFeedback" boolean DEFAULT false NOT NULL,
	"videoConferenceLink" boolean DEFAULT false NOT NULL,
	"resources" jsonb DEFAULT '[]' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "teamsinta-saas-starterkit_membersToOrganizations" ALTER COLUMN "role" SET DEFAULT 'Interviewer';--> statement-breakpoint
ALTER TABLE "teamsinta-saas-starterkit_membersToOrganizations" ADD COLUMN "slack_user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "teamsinta-saas-starterkit_organization" ADD COLUMN "slack_refresh_token" varchar(1024);--> statement-breakpoint
ALTER TABLE "teamsinta-saas-starterkit_organization" ADD COLUMN "token_expiry" integer;--> statement-breakpoint
ALTER TABLE "teamsinta-saas-starterkit_organization" ADD COLUMN "greenhouse_api_token" varchar(255);--> statement-breakpoint
ALTER TABLE "teamsinta-saas-starterkit_organization" ADD COLUMN "greenhouse_subdomain" varchar(255);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teamsinta-saas-starterkit_hiringroom" ADD CONSTRAINT "teamsinta-saas-starterkit_hiringroom_ownerId_teamsinta-saas-starterkit_user_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."teamsinta-saas-starterkit_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teamsinta-saas-starterkit_hiringroom" ADD CONSTRAINT "teamsinta-saas-starterkit_hiringroom_organizationId_teamsinta-saas-starterkit_organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."teamsinta-saas-starterkit_organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teamsinta-saas-starterkit_user_preferences" ADD CONSTRAINT "teamsinta-saas-starterkit_user_preferences_userId_teamsinta-saas-starterkit_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."teamsinta-saas-starterkit_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teamsinta-saas-starterkit_user_preferences" ADD CONSTRAINT "teamsinta-saas-starterkit_user_preferences_organizationId_teamsinta-saas-starterkit_organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."teamsinta-saas-starterkit_organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "teamsinta-saas-starterkit_organization" DROP COLUMN IF EXISTS "access_token";