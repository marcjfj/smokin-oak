import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_menu_items_category" AS ENUM('appetizer', 'main-course', 'side-dish', 'dessert', 'drink', 'special');
  CREATE TABLE IF NOT EXISTS "menu_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" jsonb,
  	"price" numeric NOT NULL,
  	"image_id" integer NOT NULL,
  	"category" "enum_menu_items_category",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "menu_items_id" integer;
  DO $$ BEGIN
   ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "menu_items_image_idx" ON "menu_items" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "menu_items_updated_at_idx" ON "menu_items" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "menu_items_created_at_idx" ON "menu_items" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_menu_items_fk" FOREIGN KEY ("menu_items_id") REFERENCES "public"."menu_items"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_menu_items_id_idx" ON "payload_locked_documents_rels" USING btree ("menu_items_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "menu_items" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "menu_items" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_menu_items_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_menu_items_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "menu_items_id";
  DROP TYPE "public"."enum_menu_items_category";`)
}
