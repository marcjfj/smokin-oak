import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_hero_ctas_icon" AS ENUM('', 'Utensils', 'MapPin');
  ALTER TABLE "pages_blocks_hero_ctas" ADD COLUMN "icon" "enum_pages_blocks_hero_ctas_icon";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_hero_ctas" DROP COLUMN IF EXISTS "icon";
  DROP TYPE "public"."enum_pages_blocks_hero_ctas_icon";`)
}
