ALTER TABLE "user" ADD COLUMN "smart_account_address" text;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_smart_account_address_unique" UNIQUE("smart_account_address");