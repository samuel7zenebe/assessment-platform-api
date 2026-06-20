ALTER TABLE "exams" ALTER COLUMN "pass_percentage" SET DEFAULT 50;--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "category" varchar(255);