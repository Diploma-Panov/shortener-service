ALTER TABLE "short_urls" DROP CONSTRAINT "short_urls_creator_member_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "short_urls" ALTER COLUMN "creator_member_id" DROP NOT NULL;