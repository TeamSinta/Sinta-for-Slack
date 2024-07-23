DO $$ BEGIN
 CREATE TYPE "public"."feedback-label" AS ENUM('Issue', 'Idea', 'Question', 'Complaint', 'Feature Request', 'Other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."feedback-status" AS ENUM('Open', 'In Progress', 'Closed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."org-member-role" AS ENUM('Viewer', 'Developer', 'Billing', 'Admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."role" AS ENUM('User', 'Admin', 'Super Admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."workflow_status" AS ENUM('Active', 'Inactive', 'Archived');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teamsinta-saas-starterkit_account" (
	"userId" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "teamsinta-saas-starterkit_account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teamsinta-saas-starterkit_feedback" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" varchar(255) NOT NULL,
	"title" varchar(255),
	"message" text NOT NULL,
	"label" "feedback-label" NOT NULL,
	"status" "feedback-status" DEFAULT 'Open' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teamsinta-saas-starterkit_membersToOrganizations" (
	"id" varchar(255) DEFAULT gen_random_uuid(),
	"memberId" varchar(255) NOT NULL,
	"memberEmail" varchar(255) NOT NULL,
	"organizationId" varchar(255) NOT NULL,
	"role" "org-member-role" DEFAULT 'Viewer' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "teamsinta-saas-starterkit_membersToOrganizations_id_memberId_organizationId_pk" PRIMARY KEY("id","memberId","organizationId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teamsinta-saas-starterkit_orgRequest" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" varchar(255) NOT NULL,
	"organizationId" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teamsinta-saas-starterkit_organization" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"image" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"ownerId" varchar(255) NOT NULL,
	"slack_team_id" varchar(255),
	"access_token" varchar(1024),
	"slack_access_token" varchar(1024),
	"incoming_webhook_url" varchar(1024)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teamsinta-saas-starterkit_session" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teamsinta-saas-starterkit_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"emailVerified" timestamp DEFAULT CURRENT_TIMESTAMP,
	"image" varchar(255),
	"role" "role" DEFAULT 'User' NOT NULL,
	"isNewUser" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teamsinta-saas-starterkit_verificationToken" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "teamsinta-saas-starterkit_verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teamsinta-saas-starterkit_workflow" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"objectField" varchar(255) NOT NULL,
	"alertType" varchar(255) NOT NULL,
	"conditions" jsonb NOT NULL,
	"trigger_config" jsonb NOT NULL,
	"recipient" jsonb NOT NULL,
	"status" "workflow_status" DEFAULT 'Active' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"modifiedAt" timestamp,
	"ownerId" varchar(255) NOT NULL,
	"organizationId" varchar(255) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teamsinta-saas-starterkit_account" ADD CONSTRAINT "teamsinta-saas-starterkit_account_userId_teamsinta-saas-starterkit_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."teamsinta-saas-starterkit_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teamsinta-saas-starterkit_feedback" ADD CONSTRAINT "teamsinta-saas-starterkit_feedback_userId_teamsinta-saas-starterkit_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."teamsinta-saas-starterkit_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teamsinta-saas-starterkit_membersToOrganizations" ADD CONSTRAINT "teamsinta-saas-starterkit_membersToOrganizations_memberId_teamsinta-saas-starterkit_user_id_fk" FOREIGN KEY ("memberId") REFERENCES "public"."teamsinta-saas-starterkit_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teamsinta-saas-starterkit_membersToOrganizations" ADD CONSTRAINT "teamsinta-saas-starterkit_membersToOrganizations_organizationId_teamsinta-saas-starterkit_organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."teamsinta-saas-starterkit_organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teamsinta-saas-starterkit_orgRequest" ADD CONSTRAINT "teamsinta-saas-starterkit_orgRequest_userId_teamsinta-saas-starterkit_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."teamsinta-saas-starterkit_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teamsinta-saas-starterkit_orgRequest" ADD CONSTRAINT "teamsinta-saas-starterkit_orgRequest_organizationId_teamsinta-saas-starterkit_organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."teamsinta-saas-starterkit_organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teamsinta-saas-starterkit_organization" ADD CONSTRAINT "teamsinta-saas-starterkit_organization_ownerId_teamsinta-saas-starterkit_user_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."teamsinta-saas-starterkit_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teamsinta-saas-starterkit_session" ADD CONSTRAINT "teamsinta-saas-starterkit_session_userId_teamsinta-saas-starterkit_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."teamsinta-saas-starterkit_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teamsinta-saas-starterkit_workflow" ADD CONSTRAINT "teamsinta-saas-starterkit_workflow_ownerId_teamsinta-saas-starterkit_user_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."teamsinta-saas-starterkit_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teamsinta-saas-starterkit_workflow" ADD CONSTRAINT "teamsinta-saas-starterkit_workflow_organizationId_teamsinta-saas-starterkit_organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."teamsinta-saas-starterkit_organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "teamsinta-saas-starterkit_account" ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orgRequest_organizationId_idx" ON "teamsinta-saas-starterkit_orgRequest" ("organizationId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "teamsinta-saas-starterkit_session" ("userId");