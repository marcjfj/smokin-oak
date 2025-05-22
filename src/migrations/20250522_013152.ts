import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "pages_blocks_header" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"image_id" integer NOT NULL,
  	"block_name" varchar
  );
  
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_header" ADD CONSTRAINT "pages_blocks_header_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_header" ADD CONSTRAINT "pages_blocks_header_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "pages_blocks_header_order_idx" ON "pages_blocks_header" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_header_parent_id_idx" ON "pages_blocks_header" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_header_path_idx" ON "pages_blocks_header" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "pages_blocks_header_image_idx" ON "pages_blocks_header" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_header" CASCADE;`)
}
