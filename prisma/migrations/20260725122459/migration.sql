/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `guests` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hotel_id` to the `room_types` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "guests" ADD COLUMN     "user_id" INTEGER;

-- AlterTable
ALTER TABLE "room_types" ADD COLUMN     "hotel_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "role" TEXT NOT NULL DEFAULT 'guest',
    "hotel_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotels" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "city" VARCHAR(100),
    "country" VARCHAR(100),
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "website" VARCHAR(255),
    "image_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approved_at" TIMESTAMP(3),
    "approved_by" INTEGER,
    "registration_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotel_registrations" (
    "id" SERIAL NOT NULL,
    "hotel_name" VARCHAR(200) NOT NULL,
    "manager_email" VARCHAR(255) NOT NULL,
    "manager_first_name" VARCHAR(100) NOT NULL,
    "manager_last_name" VARCHAR(100) NOT NULL,
    "manager_phone" VARCHAR(20),
    "hotel_address" TEXT,
    "hotel_city" VARCHAR(100),
    "hotel_country" VARCHAR(100),
    "hotel_phone" VARCHAR(20),
    "hotel_email" VARCHAR(255),
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "admin_notes" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "processed_by" INTEGER,
    "hotel_id" INTEGER,
    "manager_id" INTEGER,

    CONSTRAINT "hotel_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "hotels_registration_id_key" ON "hotels"("registration_id");

-- CreateIndex
CREATE UNIQUE INDEX "hotel_registrations_hotel_id_key" ON "hotel_registrations"("hotel_id");

-- CreateIndex
CREATE UNIQUE INDEX "guests_user_id_key" ON "guests"("user_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotels" ADD CONSTRAINT "hotels_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "hotel_registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotels" ADD CONSTRAINT "hotels_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_registrations" ADD CONSTRAINT "hotel_registrations_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_registrations" ADD CONSTRAINT "hotel_registrations_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_types" ADD CONSTRAINT "room_types_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guests" ADD CONSTRAINT "guests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
