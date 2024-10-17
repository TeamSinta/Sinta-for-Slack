ALTER TABLE "teamsinta-saas-starterkit_hiringroom" ADD COLUMN "actions" jsonb;--> statement-breakpoint
ALTER TABLE "teamsinta-saas-starterkit_organization" ADD COLUMN "greenhouse_secret_key" varchar(255);--> statement-breakpoint
ALTER TABLE "teamsinta-saas-starterkit_slack_channels_created" ADD COLUMN "organizationId" varchar(255) NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teamsinta-saas-starterkit_slack_channels_created" ADD CONSTRAINT "teamsinta-saas-starterkit_slack_channels_created_organizationId_teamsinta-saas-starterkit_organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."teamsinta-saas-starterkit_organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "public"."teamsinta-saas-starterkit_membersToOrganizations" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "public"."teamsinta-saas-starterkit_user_preferences" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."org-member-role";--> statement-breakpoint
CREATE TYPE "public"."org-member-role" AS ENUM('Interviewer', 'Recruiter', 'Hiring Manager');--> statement-breakpoint
ALTER TABLE "public"."teamsinta-saas-starterkit_membersToOrganizations" ALTER COLUMN "role" SET DATA TYPE "public"."org-member-role" USING "role"::"public"."org-member-role";--> statement-breakpoint
ALTER TABLE "public"."teamsinta-saas-starterkit_user_preferences" ALTER COLUMN "role" SET DATA TYPE "public"."org-member-role" USING "role"::"public"."org-member-role";