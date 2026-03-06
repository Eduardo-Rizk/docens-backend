-- CreateIndex
CREATE INDEX "enrollments_class_event_id_status_idx" ON "enrollments"("class_event_id", "status");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");
