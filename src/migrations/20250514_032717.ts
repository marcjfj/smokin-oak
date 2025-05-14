import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "menu_items" ADD COLUMN "category_id" integer;
  DO $$ BEGIN
   ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "menu_items_category_idx" ON "menu_items" USING btree ("category_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "menu_items" DROP CONSTRAINT "menu_items_category_id_categories_id_fk";
  
  DROP INDEX IF EXISTS "menu_items_category_idx";
  ALTER TABLE "menu_items" DROP COLUMN IF EXISTS "category_id";`)
}
