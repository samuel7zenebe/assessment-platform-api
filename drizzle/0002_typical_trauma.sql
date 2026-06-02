CREATE TABLE "exam_job_titles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exam_id" uuid NOT NULL,
	"job_title_id" uuid NOT NULL,
	"weight_percentage" integer DEFAULT 100 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"question_count" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_exam_job_title" UNIQUE("exam_id","job_title_id")
);
--> statement-breakpoint
ALTER TABLE "exam_job_titles" ADD CONSTRAINT "exam_job_titles_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_job_titles" ADD CONSTRAINT "exam_job_titles_job_title_id_job_titles_id_fk" FOREIGN KEY ("job_title_id") REFERENCES "public"."job_titles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "exam_job_title_exam_idx" ON "exam_job_titles" USING btree ("exam_id");--> statement-breakpoint
CREATE INDEX "exam_job_title_job_idx" ON "exam_job_titles" USING btree ("job_title_id");--> statement-breakpoint
ALTER TABLE "exams" DROP COLUMN "job_title_ids";