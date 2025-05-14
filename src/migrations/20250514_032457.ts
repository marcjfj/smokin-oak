import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   -- Attempt to drop constraint only if it exists (more robust for varied states)
   -- However, the main issue is the column, so we ensure that's dropped first or confirmed gone.
   ALTER TABLE "menu_items" DROP COLUMN IF EXISTS "category_id";
   DROP INDEX IF EXISTS "menu_items_category_idx"; -- Drop index if it exists
   -- The foreign key constraint menu_items_category_id_categories_id_fk would be automatically dropped if category_id is dropped.
   -- Just in case, try to drop any old enum type directly if its name is known and was missed by previous cleanups.
   DROP TYPE IF EXISTS "public"."enum_menu_items_category";
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // The down migration attempts to recreate the state *before* this cleanup.
  // This assumes category_id was an integer relationship.
  await db.execute(sql`
   ALTER TABLE "menu_items" ADD COLUMN "category_id" integer; -- Assuming it should be nullable by default if recreated
  DO $$ BEGIN
   ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "menu_items_category_idx" ON "menu_items" USING btree ("category_id");
  `)
}
