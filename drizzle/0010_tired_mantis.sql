ALTER TYPE "public"."user_role" ADD VALUE 'SUPER_ADMIN';--> statement-breakpoint
CREATE TABLE "job_title_permissions" (
	"job_title_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"create_question" boolean,
	"update_question" boolean,
	"delete_question" boolean,
	"edit_question" boolean,
	CONSTRAINT "job_title_permissions_user_id_job_title_id_pk" PRIMARY KEY("user_id","job_title_id")
);
--> statement-breakpoint
ALTER TABLE "job_titles" ADD COLUMN "department" varchar;--> statement-breakpoint
ALTER TABLE "job_title_permissions" ADD CONSTRAINT "job_title_permissions_job_title_id_job_titles_id_fk" FOREIGN KEY ("job_title_id") REFERENCES "public"."job_titles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_title_permissions" ADD CONSTRAINT "job_title_permissions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;