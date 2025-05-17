import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "menu_items_sub_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"price" numeric NOT NULL
  );
  
  ALTER TABLE "menu_items" ALTER COLUMN "price" DROP NOT NULL;
  DO $$ BEGIN
   ALTER TABLE "menu_items_sub_items" ADD CONSTRAINT "menu_items_sub_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."menu_items"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "menu_items_sub_items_order_idx" ON "menu_items_sub_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "menu_items_sub_items_parent_id_idx" ON "menu_items_sub_items" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "menu_items_sub_items" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "menu_items_sub_items" CASCADE;
  ALTER TABLE "menu_items" ALTER COLUMN "price" SET NOT NULL;`)
}
