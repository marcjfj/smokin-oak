import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_status_current_status" AS ENUM('open', 'sold-out', 'closed-unscheduled');
  CREATE TABLE IF NOT EXISTS "status" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"current_status" "enum_status_current_status" DEFAULT 'open' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "status" CASCADE;
  DROP TYPE "public"."enum_status_current_status";`)
}
