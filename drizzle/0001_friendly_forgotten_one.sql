ALTER TABLE "question_bank" ADD COLUMN "difficulty_label" "difficulty_level" NOT NULL;--> statement-breakpoint
ALTER TABLE "question_bank" DROP COLUMN "difficulty_level";