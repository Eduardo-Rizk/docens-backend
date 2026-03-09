/*
  Warnings:

  - A unique constraint covering the columns `[institution_id,subject_id,year_label,course_id]` on the table `institution_subjects` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "institution_subjects_institution_id_subject_id_year_label_key";

-- AlterTable
ALTER TABLE "institution_subjects" ADD COLUMN     "course_id" UUID;

-- AlterTable
ALTER TABLE "institutions" ADD COLUMN     "is_enabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "courses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "institution_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "courses_institution_id_idx" ON "courses"("institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "courses_institution_id_slug_key" ON "courses"("institution_id", "slug");

-- CreateIndex
CREATE INDEX "institution_subjects_course_id_idx" ON "institution_subjects"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "institution_subjects_institution_id_subject_id_year_label_c_key" ON "institution_subjects"("institution_id", "subject_id", "year_label", "course_id");

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_subjects" ADD CONSTRAINT "institution_subjects_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
