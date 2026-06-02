CREATE TYPE "public"."exam_generation_mode" AS ENUM('QUESTION_COUNT', 'POINT_TARGET', 'HYBRID');--> statement-breakpoint
CREATE TABLE "attempt_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"question_order" integer NOT NULL,
	"question_snapshot" jsonb NOT NULL,
	"shuffled_choices" jsonb,
	"viewed_at" timestamp with time zone,
	"answered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_attempt_question" UNIQUE("attempt_id","question_id")
);
--> statement-breakpoint
ALTER TABLE "answers" DROP CONSTRAINT "answers_attempt_id_exam_attempts_id_fk";
--> statement-breakpoint
ALTER TABLE "answers" DROP CONSTRAINT "answers_question_id_question_bank_id_fk";
--> statement-breakpoint
ALTER TABLE "exams" ALTER COLUMN "total_questions" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "question_bank" ALTER COLUMN "difficulty_label" SET DEFAULT 'MEDIUM';--> statement-breakpoint
ALTER TABLE "answers" ADD COLUMN "attempt_question_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "answers" ADD COLUMN "selected_choice_id" uuid;--> statement-breakpoint
ALTER TABLE "answers" ADD COLUMN "boolean_answer" boolean;--> statement-breakpoint
ALTER TABLE "answers" ADD COLUMN "answer_json" jsonb;--> statement-breakpoint
ALTER TABLE "answers" ADD COLUMN "manually_reviewed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "answers" ADD COLUMN "reviewer_feedback" text;--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "generation_mode" "exam_generation_mode" DEFAULT 'QUESTION_COUNT' NOT NULL;--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "target_points" integer;--> statement-breakpoint
ALTER TABLE "question_bank" ADD COLUMN "title" varchar(255);--> statement-breakpoint
ALTER TABLE "question_bank" ADD COLUMN "audio_url" text;--> statement-breakpoint
ALTER TABLE "question_bank" ADD COLUMN "video_url" text;--> statement-breakpoint
ALTER TABLE "question_bank" ADD COLUMN "estimated_time_seconds" integer DEFAULT 60 NOT NULL;--> statement-breakpoint
ALTER TABLE "question_bank" ADD COLUMN "explanation" text;--> statement-breakpoint
ALTER TABLE "question_bank" ADD COLUMN "question_data" jsonb;--> statement-breakpoint
ALTER TABLE "question_bank" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "question_bank" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "question_bank" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "question_choices" ADD COLUMN "choice_key" varchar(10);--> statement-breakpoint
ALTER TABLE "question_choices" ADD COLUMN "explanation" text;--> statement-breakpoint
ALTER TABLE "question_choices" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "question_choices" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "attempt_questions" ADD CONSTRAINT "attempt_questions_attempt_id_exam_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."exam_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_questions" ADD CONSTRAINT "attempt_questions_question_id_question_bank_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question_bank"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attempt_question_attempt_idx" ON "attempt_questions" USING btree ("attempt_id");--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_attempt_question_id_attempt_questions_id_fk" FOREIGN KEY ("attempt_question_id") REFERENCES "public"."attempt_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_selected_choice_id_question_choices_id_fk" FOREIGN KEY ("selected_choice_id") REFERENCES "public"."question_choices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "answer_attempt_question_idx" ON "answers" USING btree ("attempt_question_id");--> statement-breakpoint
CREATE INDEX "question_type_idx" ON "question_bank" USING btree ("type");--> statement-breakpoint
CREATE INDEX "question_difficulty_idx" ON "question_bank" USING btree ("difficulty_label");--> statement-breakpoint
CREATE INDEX "question_active_idx" ON "question_bank" USING btree ("is_active");--> statement-breakpoint
ALTER TABLE "answers" DROP COLUMN "attempt_id";--> statement-breakpoint
ALTER TABLE "answers" DROP COLUMN "question_id";--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "unique_attempt_question_order" UNIQUE("attempt_question_id");