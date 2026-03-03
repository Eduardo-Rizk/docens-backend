-- AlterTable
ALTER TABLE "enrollments" ADD COLUMN     "expires_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "paid_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "class_events_institution_id_publication_status_idx" ON "class_events"("institution_id", "publication_status");

-- CreateIndex
CREATE INDEX "class_events_teacher_profile_id_starts_at_idx" ON "class_events"("teacher_profile_id", "starts_at");

-- CreateIndex
CREATE INDEX "class_events_publication_status_starts_at_idx" ON "class_events"("publication_status", "starts_at");

-- CreateIndex
CREATE INDEX "enrollments_student_profile_id_status_idx" ON "enrollments"("student_profile_id", "status");
