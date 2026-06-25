CREATE TYPE "public"."resource_permission" AS ENUM('VIEW', 'CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'ASSIGN', 'MANAGE');--> statement-breakpoint
CREATE TYPE "public"."resource_type" AS ENUM('JOB_TITLE', 'DEPARTMENT', 'QUESTION', 'EXAM');--> statement-breakpoint
CREATE TABLE "resource_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"resource_type" "resource_type" NOT NULL,
	"resource_id" uuid NOT NULL,
	"permission" "resource_permission" NOT NULL,
	"granted_by" text,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"notes" text,
	CONSTRAINT "resource_permission_unique" UNIQUE("user_id","resource_type","resource_id","permission")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "temporary_candidate" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "resource_permissions" ADD CONSTRAINT "resource_permissions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_permissions" ADD CONSTRAINT "resource_permissions_granted_by_user_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "resource_permission_user_idx" ON "resource_permissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "resource_permission_resource_idx" ON "resource_permissions" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "resource_permission_permission_idx" ON "resource_permissions" USING btree ("permission");