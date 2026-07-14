ALTER TABLE "exams" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "exams" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::text;--> statement-breakpoint
DROP TYPE "public"."exam_status";--> statement-breakpoint
CREATE TYPE "public"."exam_status" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED', 'ACTIVE', 'CLOSED');--> statement-breakpoint
ALTER TABLE "exams" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"public"."exam_status";--> statement-breakpoint
ALTER TABLE "exams" ALTER COLUMN "status" SET DATA TYPE "public"."exam_status" USING "status"::"public"."exam_status";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'CANDIDATE'::text;--> statement-breakpoint
DROP TYPE "public"."user_role";--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('CANDIDATE', 'BUILDER', 'ADMIN', 'SUPER_ADMIN');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'CANDIDATE'::"public"."user_role";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "allowed_attempts" integer DEFAULT 1;