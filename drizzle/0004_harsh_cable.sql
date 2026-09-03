ALTER TABLE "course" ADD COLUMN "enrollment_mode" text DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "lesson" ADD COLUMN "section_title" text DEFAULT '' NOT NULL;--> statement-breakpoint
UPDATE "course" SET "enrollment_mode" = 'self_service' WHERE "slug" = 'cooking-foundations-online';
