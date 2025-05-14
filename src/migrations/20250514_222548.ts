import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_business_hours_schedule_day" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TABLE IF NOT EXISTS "social_media_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "social_media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "business_hours_schedule" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day" "enum_business_hours_schedule_day" NOT NULL,
  	"time_range" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "business_hours" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  DO $$ BEGIN
   ALTER TABLE "social_media_links" ADD CONSTRAINT "social_media_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."social_media"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "business_hours_schedule" ADD CONSTRAINT "business_hours_schedule_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."business_hours"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "social_media_links_order_idx" ON "social_media_links" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "social_media_links_parent_id_idx" ON "social_media_links" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "business_hours_schedule_order_idx" ON "business_hours_schedule" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "business_hours_schedule_parent_id_idx" ON "business_hours_schedule" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "social_media_links" CASCADE;
  DROP TABLE "social_media" CASCADE;
  DROP TABLE "business_hours_schedule" CASCADE;
  DROP TABLE "business_hours" CASCADE;
  DROP TYPE "public"."enum_business_hours_schedule_day";`)
}
