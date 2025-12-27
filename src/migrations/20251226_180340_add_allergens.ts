import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "allergens" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"number" numeric NOT NULL,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "ingredients_rels" ADD COLUMN "allergens_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "allergens_id" integer;
  CREATE UNIQUE INDEX "allergens_number_idx" ON "allergens" USING btree ("number");
  CREATE INDEX "allergens_updated_at_idx" ON "allergens" USING btree ("updated_at");
  CREATE INDEX "allergens_created_at_idx" ON "allergens" USING btree ("created_at");
  ALTER TABLE "ingredients_rels" ADD CONSTRAINT "ingredients_rels_allergens_fk" FOREIGN KEY ("allergens_id") REFERENCES "public"."allergens"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_allergens_fk" FOREIGN KEY ("allergens_id") REFERENCES "public"."allergens"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "ingredients_rels_allergens_id_idx" ON "ingredients_rels" USING btree ("allergens_id");
  CREATE INDEX "payload_locked_documents_rels_allergens_id_idx" ON "payload_locked_documents_rels" USING btree ("allergens_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "allergens" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "allergens" CASCADE;
  ALTER TABLE "ingredients_rels" DROP CONSTRAINT "ingredients_rels_allergens_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_allergens_fk";
  
  DROP INDEX "ingredients_rels_allergens_id_idx";
  DROP INDEX "payload_locked_documents_rels_allergens_id_idx";
  ALTER TABLE "ingredients_rels" DROP COLUMN "allergens_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "allergens_id";`)
}
