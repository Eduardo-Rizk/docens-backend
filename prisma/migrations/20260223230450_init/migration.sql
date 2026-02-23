-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('STUDENT', 'TEACHER');

-- CreateEnum
CREATE TYPE "institution_type" AS ENUM ('SCHOOL', 'UNIVERSITY');

-- CreateEnum
CREATE TYPE "publication_status" AS ENUM ('DRAFT', 'PUBLISHED', 'FINISHED');

-- CreateEnum
CREATE TYPE "meeting_status" AS ENUM ('LOCKED', 'RELEASED');

-- CreateEnum
CREATE TYPE "enrollment_status" AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "payment_provider" AS ENUM ('STRIPE', 'MERCADOPAGO', 'MOCK');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "supabase_id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "email" VARCHAR(200) NOT NULL,
    "phone" VARCHAR(30) NOT NULL,
    "role" "user_role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "preferred_institution_id" UUID,
    "labels" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "photo" VARCHAR(2) NOT NULL DEFAULT '??',
    "photo_url" TEXT,
    "bio" TEXT NOT NULL DEFAULT '',
    "headline" VARCHAR(100) NOT NULL DEFAULT '',
    "labels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "teacher_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institutions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(200) NOT NULL,
    "short_name" VARCHAR(50) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "type" "institution_type" NOT NULL,
    "logo_url" TEXT NOT NULL,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "icon" VARCHAR(50),

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institution_subjects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "institution_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "year_label" VARCHAR(50) NOT NULL,
    "year_order" INTEGER NOT NULL,

    CONSTRAINT "institution_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_institutions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "teacher_profile_id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,

    CONSTRAINT "teacher_institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_institutions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_profile_id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,

    CONSTRAINT "student_institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_subjects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "teacher_profile_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "level_tag" VARCHAR(50),

    CONSTRAINT "teacher_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "teacher_profile_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "duration_min" INTEGER NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "sold_seats" INTEGER NOT NULL DEFAULT 0,
    "publication_status" "publication_status" NOT NULL DEFAULT 'DRAFT',
    "meeting_status" "meeting_status" NOT NULL DEFAULT 'LOCKED',
    "meeting_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "class_event_id" UUID NOT NULL,
    "student_profile_id" UUID NOT NULL,
    "status" "enrollment_status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "enrollment_id" UUID NOT NULL,
    "provider" "payment_provider" NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "status" "payment_status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_supabase_id_key" ON "users"("supabase_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_user_id_key" ON "student_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_profiles_user_id_key" ON "teacher_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "institution_subjects_institution_id_subject_id_year_label_key" ON "institution_subjects"("institution_id", "subject_id", "year_label");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_institutions_teacher_profile_id_institution_id_key" ON "teacher_institutions"("teacher_profile_id", "institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_institutions_student_profile_id_institution_id_key" ON "student_institutions"("student_profile_id", "institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_subjects_teacher_profile_id_subject_id_key" ON "teacher_subjects"("teacher_profile_id", "subject_id");

-- CreateIndex
CREATE INDEX "class_events_institution_id_idx" ON "class_events"("institution_id");

-- CreateIndex
CREATE INDEX "class_events_subject_id_idx" ON "class_events"("subject_id");

-- CreateIndex
CREATE INDEX "class_events_teacher_profile_id_idx" ON "class_events"("teacher_profile_id");

-- CreateIndex
CREATE INDEX "class_events_publication_status_idx" ON "class_events"("publication_status");

-- CreateIndex
CREATE INDEX "enrollments_class_event_id_idx" ON "enrollments"("class_event_id");

-- CreateIndex
CREATE INDEX "enrollments_student_profile_id_idx" ON "enrollments"("student_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_class_event_id_student_profile_id_key" ON "enrollments"("class_event_id", "student_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_enrollment_id_key" ON "payments"("enrollment_id");

-- CreateIndex
CREATE INDEX "payments_enrollment_id_idx" ON "payments"("enrollment_id");

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_preferred_institution_id_fkey" FOREIGN KEY ("preferred_institution_id") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_profiles" ADD CONSTRAINT "teacher_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_subjects" ADD CONSTRAINT "institution_subjects_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_subjects" ADD CONSTRAINT "institution_subjects_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_institutions" ADD CONSTRAINT "teacher_institutions_teacher_profile_id_fkey" FOREIGN KEY ("teacher_profile_id") REFERENCES "teacher_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_institutions" ADD CONSTRAINT "teacher_institutions_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_institutions" ADD CONSTRAINT "student_institutions_student_profile_id_fkey" FOREIGN KEY ("student_profile_id") REFERENCES "student_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_institutions" ADD CONSTRAINT "student_institutions_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_teacher_profile_id_fkey" FOREIGN KEY ("teacher_profile_id") REFERENCES "teacher_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_events" ADD CONSTRAINT "class_events_teacher_profile_id_fkey" FOREIGN KEY ("teacher_profile_id") REFERENCES "teacher_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_events" ADD CONSTRAINT "class_events_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_events" ADD CONSTRAINT "class_events_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_class_event_id_fkey" FOREIGN KEY ("class_event_id") REFERENCES "class_events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_profile_id_fkey" FOREIGN KEY ("student_profile_id") REFERENCES "student_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
