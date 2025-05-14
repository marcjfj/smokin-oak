import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   -- Ensure conflicting column and type are dropped first
   ALTER TABLE "menu_items" DROP COLUMN IF EXISTS "category_id";
   ALTER TABLE "menu_items" DROP COLUMN IF EXISTS "category"; -- Also drop the original if it exists
   DROP TYPE IF EXISTS "public"."enum_menu_items_category";

   -- ALTER TABLE "menu_items" RENAME COLUMN "category" TO "category_id"; -- Commented out
  -- DO $$ BEGIN
   -- ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action; -- Commented out
  -- EXCEPTION
   -- WHEN duplicate_object THEN null;
  -- END $$;
  
  -- CREATE INDEX IF NOT EXISTS "menu_items_category_idx" ON "menu_items" USING btree ("category_id"); -- Commented out as category_id is dropped
   -- The original DROP TYPE is kept, but we also added one at the top for safety.
   DROP TYPE IF EXISTS "public"."enum_menu_items_category";
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_menu_items_category" AS ENUM('appetizer', 'main-course', 'side-dish', 'dessert', 'drink', 'special');
  ALTER TABLE "menu_items" RENAME COLUMN "category_id" TO "category";
  ALTER TABLE "menu_items" DROP CONSTRAINT "menu_items_category_id_categories_id_fk";
  
  DROP INDEX IF EXISTS "menu_items_category_idx";`)
}
