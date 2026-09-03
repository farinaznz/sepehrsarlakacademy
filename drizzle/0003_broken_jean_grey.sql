CREATE TABLE "lesson_comment" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"body" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"moderated_by_user_id" text,
	"moderated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "role" ("id", "label") VALUES ('instructor', 'مدرس') ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
CREATE TABLE "lesson_note" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lesson" ADD COLUMN "drip_delay_days" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "lesson_comment" ADD CONSTRAINT "lesson_comment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_comment" ADD CONSTRAINT "lesson_comment_lesson_id_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_comment" ADD CONSTRAINT "lesson_comment_moderated_by_user_id_user_id_fk" FOREIGN KEY ("moderated_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_note" ADD CONSTRAINT "lesson_note_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_note" ADD CONSTRAINT "lesson_note_lesson_id_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lessonComment_lessonId_status_idx" ON "lesson_comment" USING btree ("lesson_id","status");--> statement-breakpoint
CREATE INDEX "lessonComment_userId_idx" ON "lesson_comment" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lessonNote_userId_lessonId_uidx" ON "lesson_note" USING btree ("user_id","lesson_id");--> statement-breakpoint
CREATE INDEX "lessonNote_userId_idx" ON "lesson_note" USING btree ("user_id");
