import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "pages_blocks_image_slider_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_image_slider" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"block_name" varchar
  );
  
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_image_slider_images" ADD CONSTRAINT "pages_blocks_image_slider_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_image_slider_images" ADD CONSTRAINT "pages_blocks_image_slider_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_image_slider"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_image_slider" ADD CONSTRAINT "pages_blocks_image_slider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "pages_blocks_image_slider_images_order_idx" ON "pages_blocks_image_slider_images" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_image_slider_images_parent_id_idx" ON "pages_blocks_image_slider_images" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_image_slider_images_image_idx" ON "pages_blocks_image_slider_images" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_image_slider_order_idx" ON "pages_blocks_image_slider" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_image_slider_parent_id_idx" ON "pages_blocks_image_slider" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_image_slider_path_idx" ON "pages_blocks_image_slider" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_image_slider_images" CASCADE;
  DROP TABLE "pages_blocks_image_slider" CASCADE;`)
}
