CREATE TYPE "public"."short_url_state" AS ENUM('PENDING', 'ACTIVE', 'NOT_ACTIVE', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."short_url_type" AS ENUM('TRIAL', 'REGULAR');--> statement-breakpoint
CREATE TABLE "organization_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_user_id" bigint NOT NULL,
	"organization_id" bigint NOT NULL,
	"display_firstname" varchar,
	"display_lastname" varchar
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"creator_user_id" bigint NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"site_url" varchar(255),
	"description" text,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "short_urls" (
	"id" serial PRIMARY KEY NOT NULL,
	"creator_member_id" bigint NOT NULL,
	"owning_organization_id" bigint NOT NULL,
	"original_url" varchar(1024) NOT NULL,
	"short_url" varchar(63) NOT NULL,
	"short_url_state" "short_url_state" NOT NULL,
	"short_url_type" "short_url_type" NOT NULL,
	"tags" text[] NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255),
	"email" varchar(255),
	CONSTRAINT "user-email-unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_member_user_id_users_id_fk" FOREIGN KEY ("member_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_creator_user_id_users_id_fk" FOREIGN KEY ("creator_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "short_urls" ADD CONSTRAINT "short_urls_creator_member_id_users_id_fk" FOREIGN KEY ("creator_member_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "short_urls" ADD CONSTRAINT "short_urls_owning_organization_id_organizations_id_fk" FOREIGN KEY ("owning_organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;