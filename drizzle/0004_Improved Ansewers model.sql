ALTER TABLE "answers" DROP CONSTRAINT "unique_attempt_question_order";--> statement-breakpoint
DROP INDEX "answer_attempt_question_idx";--> statement-breakpoint
ALTER TABLE "answers" ADD COLUMN "reviewed_by" text;--> statement-breakpoint
ALTER TABLE "answers" ADD COLUMN "reviewed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "answers" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "answers_attempt_question_idx" ON "answers" USING btree ("attempt_question_id");--> statement-breakpoint
CREATE INDEX "answers_reviewed_by_idx" ON "answers" USING btree ("reviewed_by");