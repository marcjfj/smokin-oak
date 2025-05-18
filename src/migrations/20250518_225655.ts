import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_contact" ADD COLUMN "image_id" integer;
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_contact" ADD CONSTRAINT "pages_blocks_contact_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "pages_blocks_contact_image_idx" ON "pages_blocks_contact" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_contact" DROP CONSTRAINT "pages_blocks_contact_image_id_media_id_fk";
  
  DROP INDEX IF EXISTS "pages_blocks_contact_image_idx";
  ALTER TABLE "pages_blocks_contact" DROP COLUMN IF EXISTS "image_id";`)
}
