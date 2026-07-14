CREATE TYPE "public"."assignment_status" AS ENUM('ASSIGNED', 'STARTED', 'COMPLETED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."attempt_status" AS ENUM('IN_PROGRESS', 'SUBMITTED', 'GRADED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."difficulty_level" AS ENUM('EASY', 'MEDIUM', 'HARD');--> statement-breakpoint
CREATE TYPE "public"."exam_generation_mode" AS ENUM('QUESTION_COUNT', 'POINT_TARGET', 'HYBRID');--> statement-breakpoint
CREATE TYPE "public"."exam_status" AS ENUM('DRAFT', 'PUBLISHED', 'ACTIVE', 'CLOSED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."permission_action" AS ENUM('VIEW', 'CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'ASSIGN');--> statement-breakpoint
CREATE TYPE "public"."permission_resource" AS ENUM('QUESTION', 'EXAM', 'CANDIDATE');--> statement-breakpoint
CREATE TYPE "public"."permission_scope" AS ENUM('JOB_TITLE', 'DEPARTMENT', 'FACTORY');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('CHOICE', 'MATCH', 'ESSAY', 'TRUE_FALSE');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('CANDIDATE', 'ADMIN', 'BUILDER', 'SUPER_ADMIN');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_question_id" uuid NOT NULL,
	"selected_choice_id" uuid,
	"answer_text" text,
	"boolean_answer" boolean,
	"answer_json" jsonb,
	"is_correct" boolean,
	"awarded_points" numeric(5, 2),
	"manually_reviewed" boolean DEFAULT false NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	"reviewer_feedback" text,
	"answered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"entity_name" varchar(255) NOT NULL,
	"entity_id" uuid NOT NULL,
	"action" varchar(100) NOT NULL,
	"changes" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"manager_id" text,
	"dgm_name" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "departments_id_unique" UNIQUE("id"),
	CONSTRAINT "departments_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "exam_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exam_id" uuid NOT NULL,
	"candidate_id" text NOT NULL,
	"attempt_number" integer DEFAULT 1 NOT NULL,
	"started_at" timestamp with time zone DEFAULT now(),
	"submitted_at" timestamp with time zone,
	"score" numeric(5, 2),
	"passed" boolean,
	"status" "attempt_status" DEFAULT 'IN_PROGRESS' NOT NULL,
	CONSTRAINT "unique_exam_attempt" UNIQUE("exam_id","candidate_id","attempt_number")
);
--> statement-breakpoint
CREATE TABLE "exam_candidates" (
	"exam_id" uuid NOT NULL,
	"candidate_id" text NOT NULL,
	"assignment_status" "assignment_status" DEFAULT 'ASSIGNED' NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exam_candidates_exam_id_candidate_id_pk" PRIMARY KEY("exam_id","candidate_id")
);
--> statement-breakpoint
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
CREATE TABLE "exam_questions" (
	"exam_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"question_order" integer NOT NULL,
	CONSTRAINT "exam_questions_exam_id_question_id_pk" PRIMARY KEY("exam_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "exams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"category" varchar(255),
	"description" text,
	"estimated_time_minutes" integer NOT NULL,
	"late_entry_grace_minutes" integer DEFAULT 15 NOT NULL,
	"scheduled_time" timestamp with time zone,
	"pass_percentage" integer DEFAULT 50 NOT NULL,
	"generation_mode" "exam_generation_mode" DEFAULT 'QUESTION_COUNT' NOT NULL,
	"total_questions" integer,
	"target_points" integer,
	"points_per_correct" integer,
	"difficulty_level" integer NOT NULL,
	"status" "exam_status" DEFAULT 'DRAFT' NOT NULL,
	"created_by" text,
	"exam_metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "exams_title_unique" UNIQUE("title")
);
--> statement-breakpoint
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
CREATE TABLE "job_titles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title_name" varchar(255) NOT NULL,
	"department_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "job_titles_title_name_unique" UNIQUE("title_name")
);
--> statement-breakpoint
CREATE TABLE "permission_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"resource" "permission_resource" NOT NULL,
	"actions" "permission_action"[] NOT NULL,
	"scope" "permission_scope" NOT NULL,
	"scope_id" uuid NOT NULL,
	"granted_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"notes" text,
	CONSTRAINT "permission_policy_unique" UNIQUE("user_id","resource","scope","scope_id")
);
--> statement-breakpoint
CREATE TABLE "question_bank" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255),
	"category" varchar(255),
	"type" "question_type" DEFAULT 'CHOICE' NOT NULL,
	"question" text NOT NULL,
	"difficulty_label" "difficulty_level" DEFAULT 'MEDIUM' NOT NULL,
	"image_url" text,
	"audio_url" text,
	"video_url" text,
	"estimated_time_seconds" integer DEFAULT 60 NOT NULL,
	"points" integer DEFAULT 1 NOT NULL,
	"explanation" text,
	"question_data" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "question_choices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"choice_text" text NOT NULL,
	"choice_key" varchar(10),
	"is_correct" boolean DEFAULT false NOT NULL,
	"explanation" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_job_titles" (
	"question_id" uuid NOT NULL,
	"job_title_id" uuid NOT NULL,
	CONSTRAINT "question_job_titles_question_id_job_title_id_pk" PRIMARY KEY("question_id","job_title_id")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"impersonated_by" text,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"password_hash" text,
	"role" "user_role" DEFAULT 'CANDIDATE' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"temporary_candidate" boolean DEFAULT false NOT NULL,
	"banned" boolean,
	"ban_reason" text,
	"ban_expires" timestamp with time zone,
	"username" varchar(255),
	"display_username" text,
	"department_id" text,
	"job_title_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "user_username_unique" UNIQUE("username"),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_attempt_question_id_attempt_questions_id_fk" FOREIGN KEY ("attempt_question_id") REFERENCES "public"."attempt_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_selected_choice_id_question_choices_id_fk" FOREIGN KEY ("selected_choice_id") REFERENCES "public"."question_choices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_questions" ADD CONSTRAINT "attempt_questions_attempt_id_exam_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."exam_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_questions" ADD CONSTRAINT "attempt_questions_question_id_question_bank_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question_bank"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_candidate_id_user_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_candidates" ADD CONSTRAINT "exam_candidates_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_candidates" ADD CONSTRAINT "exam_candidates_candidate_id_user_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_job_titles" ADD CONSTRAINT "exam_job_titles_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_job_titles" ADD CONSTRAINT "exam_job_titles_job_title_id_job_titles_id_fk" FOREIGN KEY ("job_title_id") REFERENCES "public"."job_titles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_questions" ADD CONSTRAINT "exam_questions_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_questions" ADD CONSTRAINT "exam_questions_question_id_question_bank_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question_bank"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_title_permissions" ADD CONSTRAINT "job_title_permissions_job_title_id_job_titles_id_fk" FOREIGN KEY ("job_title_id") REFERENCES "public"."job_titles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_title_permissions" ADD CONSTRAINT "job_title_permissions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_titles" ADD CONSTRAINT "job_titles_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permission_policies" ADD CONSTRAINT "permission_policies_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permission_policies" ADD CONSTRAINT "permission_policies_granted_by_user_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_bank" ADD CONSTRAINT "question_bank_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_choices" ADD CONSTRAINT "question_choices_question_id_question_bank_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question_bank"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_job_titles" ADD CONSTRAINT "question_job_titles_question_id_question_bank_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question_bank"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_job_titles" ADD CONSTRAINT "question_job_titles_job_title_id_job_titles_id_fk" FOREIGN KEY ("job_title_id") REFERENCES "public"."job_titles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_job_title_id_job_titles_id_fk" FOREIGN KEY ("job_title_id") REFERENCES "public"."job_titles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "answers_attempt_question_idx" ON "answers" USING btree ("attempt_question_id");--> statement-breakpoint
CREATE INDEX "answers_reviewed_by_idx" ON "answers" USING btree ("reviewed_by");--> statement-breakpoint
CREATE INDEX "attempt_question_attempt_idx" ON "attempt_questions" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "exam_attempt_candidate_idx" ON "exam_attempts" USING btree ("candidate_id");--> statement-breakpoint
CREATE INDEX "exam_job_title_exam_idx" ON "exam_job_titles" USING btree ("exam_id");--> statement-breakpoint
CREATE INDEX "exam_job_title_job_idx" ON "exam_job_titles" USING btree ("job_title_id");--> statement-breakpoint
CREATE INDEX "exam_created_by_idx" ON "exams" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "job_title_department_id_idx" ON "job_titles" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "permission_policy_user_idx" ON "permission_policies" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "permission_policy_resource_idx" ON "permission_policies" USING btree ("resource");--> statement-breakpoint
CREATE INDEX "permission_policy_scope_idx" ON "permission_policies" USING btree ("scope","scope_id");--> statement-breakpoint
CREATE INDEX "question_type_idx" ON "question_bank" USING btree ("type");--> statement-breakpoint
CREATE INDEX "question_difficulty_idx" ON "question_bank" USING btree ("difficulty_label");--> statement-breakpoint
CREATE INDEX "question_created_by_idx" ON "question_bank" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "question_active_idx" ON "question_bank" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "question_choices_question_id_idx" ON "question_choices" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "user" USING btree ("role");--> statement-breakpoint
CREATE INDEX "user_department_id_idx" ON "user" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "user_job_title_id_idx" ON "user" USING btree ("job_title_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");