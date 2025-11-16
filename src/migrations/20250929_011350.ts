import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "catering_menu_sub_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"price" numeric NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "catering_menu" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" numeric NOT NULL,
  	"name" varchar NOT NULL,
  	"description" jsonb,
  	"price" numeric,
  	"image_id" integer,
  	"category_id" integer NOT NULL,
  	"is_published" boolean DEFAULT true,
  	"minimum_order" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "catering_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"order" numeric DEFAULT 0 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "catering_menu_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "catering_categories_id" integer;
  DO $$ BEGIN
   ALTER TABLE "catering_menu_sub_items" ADD CONSTRAINT "catering_menu_sub_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."catering_menu"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "catering_menu" ADD CONSTRAINT "catering_menu_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "catering_menu" ADD CONSTRAINT "catering_menu_category_id_catering_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."catering_categories"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "catering_menu_sub_items_order_idx" ON "catering_menu_sub_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "catering_menu_sub_items_parent_id_idx" ON "catering_menu_sub_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "catering_menu_image_idx" ON "catering_menu" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "catering_menu_category_idx" ON "catering_menu" USING btree ("category_id");
  CREATE INDEX IF NOT EXISTS "catering_menu_updated_at_idx" ON "catering_menu" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "catering_menu_created_at_idx" ON "catering_menu" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "catering_categories_updated_at_idx" ON "catering_categories" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "catering_categories_created_at_idx" ON "catering_categories" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_catering_menu_fk" FOREIGN KEY ("catering_menu_id") REFERENCES "public"."catering_menu"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_catering_categories_fk" FOREIGN KEY ("catering_categories_id") REFERENCES "public"."catering_categories"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_catering_menu_id_idx" ON "payload_locked_documents_rels" USING btree ("catering_menu_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_catering_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("catering_categories_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "catering_menu_sub_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "catering_menu" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "catering_categories" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "catering_menu_sub_items" CASCADE;
  DROP TABLE "catering_menu" CASCADE;
  DROP TABLE "catering_categories" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_catering_menu_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_catering_categories_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_catering_menu_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_catering_categories_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "catering_menu_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "catering_categories_id";`)
}
