-- RenameColumn
ALTER TABLE "users" RENAME COLUMN "supabase_id" TO "clerk_id";

-- RenameIndex (Prisma auto-generated unique index name)
ALTER INDEX "users_supabase_id_key" RENAME TO "users_clerk_id_key";
