-- DropForeignKey
ALTER TABLE "Employees" DROP CONSTRAINT "Employees_user_id_fkey";

-- AlterTable
ALTER TABLE "Employees" ALTER COLUMN "user_id" DROP NOT NULL,
ALTER COLUMN "is_archived" SET DEFAULT false;

-- AlterTable
ALTER TABLE "employee_spouses" ALTER COLUMN "is_active" SET DEFAULT true;

-- AddForeignKey
ALTER TABLE "Employees" ADD CONSTRAINT "Employees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("Id") ON DELETE SET NULL ON UPDATE CASCADE;
