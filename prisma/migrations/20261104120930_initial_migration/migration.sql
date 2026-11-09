-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Admin', 'Manager', 'Developer', 'Cashier', 'Driver', 'HR', 'Finance', 'Waiter', 'Technician', 'Legal', 'Stock_Manager', 'Chef', 'Controller', 'Employee', 'Customer');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED');

-- CreateEnum
CREATE TYPE "MarriageRegime" AS ENUM ('MONOGAMOUS', 'POLYGAMOUS');

-- CreateEnum
CREATE TYPE "SkillCategory" AS ENUM ('TECHNICAL', 'LANGUAGE', 'SOFT_SKILL', 'DOMAIN');

-- CreateEnum
CREATE TYPE "ProficiencyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "Relationship" AS ENUM ('MOTHER', 'FATHER', 'SIBLING', 'SPOUSE', 'FRIEND', 'OTHER');

-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('PRIMARY', 'ACTING', 'INTERIM', 'SECONDMENT');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('CDI', 'CDD', 'STAGE', 'TEMPORAIRE', 'APPRENTISSAGE');

-- CreateEnum
CREATE TYPE "TerminationReason" AS ENUM ('END_OF_TERM', 'RESIGNATION', 'DISMISSAL_FAULT', 'DISMISSAL_ECONOMIC', 'MUTUAL_AGREEMENT', 'DEATH', 'RETIREMENT');

-- CreateEnum
CREATE TYPE "SpouseEndReason" AS ENUM ('divorce', 'death');

-- CreateTable
CREATE TABLE "User" (
    "Id" TEXT NOT NULL,
    "First Name" TEXT NOT NULL,
    "Last Name" TEXT,
    "Role" "Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Employees" (
    "employee_matricule" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "last_name" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "hire_date" DATE NOT NULL,
    "departure_date" DATE,
    "country" TEXT NOT NULL,
    "niu_number" TEXT,
    "cnps_number" TEXT,
    "marital_status" "MaritalStatus" NOT NULL,
    "marriage_regime" "MarriageRegime",
    "phone" TEXT,
    "email" TEXT,
    "residence_address_line" TEXT,
    "is_archived" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employees_pkey" PRIMARY KEY ("employee_matricule")
);

-- CreateTable
CREATE TABLE "company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "creation_date" DATE NOT NULL,
    "isParent" BOOLEAN NOT NULL,
    "parent_company_id" TEXT,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department" (
    "department_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parent_department_id" TEXT,
    "description" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,

    CONSTRAINT "department_pkey" PRIMARY KEY ("department_id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "function_description" TEXT,
    "supervisor_id" TEXT,
    "department_id" TEXT NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_spouses" (
    "spouse_matricule" TEXT NOT NULL,
    "employee_matricule" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "gender" "Gender" NOT NULL,
    "cni_number" TEXT,
    "marriage_date" DATE NOT NULL,
    "marriage_certificate_no" TEXT,
    "is_dependent" BOOLEAN NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "ended_on" DATE,
    "end_reason" "SpouseEndReason",

    CONSTRAINT "employee_spouses_pkey" PRIMARY KEY ("spouse_matricule")
);

-- CreateTable
CREATE TABLE "employee_children" (
    "child_matricule" TEXT NOT NULL,
    "employee_matricule" TEXT NOT NULL,
    "spouse_matricule" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "is_dependent" BOOLEAN NOT NULL,
    "gender" "Gender" NOT NULL,
    "birth_certificate_no" TEXT,

    CONSTRAINT "employee_children_pkey" PRIMARY KEY ("child_matricule")
);

-- CreateTable
CREATE TABLE "employee_parents" (
    "parent_matricule" TEXT NOT NULL,
    "employee_matricule" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "is_alive" BOOLEAN NOT NULL,
    "date_of_birth" DATE,
    "gender" "Gender" NOT NULL,
    "is_dependent" BOOLEAN NOT NULL,

    CONSTRAINT "employee_parents_pkey" PRIMARY KEY ("parent_matricule")
);

-- CreateTable
CREATE TABLE "emergency_contacts" (
    "contact_id" TEXT NOT NULL,
    "employee_matricule" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "last_name" TEXT NOT NULL,
    "relationship" "Relationship" NOT NULL,
    "phone" TEXT NOT NULL,
    "alternate_phone" TEXT,
    "address_line" TEXT,
    "priority_order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL,

    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("contact_id")
);

-- CreateTable
CREATE TABLE "academic_credential" (
    "id" TEXT NOT NULL,
    "employee_matricule" TEXT NOT NULL,
    "degree_name" TEXT NOT NULL,
    "institution_attended" TEXT NOT NULL,
    "field_of_study" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "completion_date" DATE,
    "grade_earned" INTEGER NOT NULL,
    "grade_scale" INTEGER NOT NULL,
    "grade_percentage" INTEGER,
    "grade_letter" TEXT,
    "diploma_number" TEXT,
    "issue_date" DATE NOT NULL,

    CONSTRAINT "academic_credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "SkillCategory" NOT NULL,
    "description" TEXT,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "position_skills" (
    "position_id" TEXT NOT NULL,
    "skill_id" TEXT NOT NULL,
    "required_level" "ProficiencyLevel" NOT NULL,
    "is_mandatory" BOOLEAN NOT NULL,

    CONSTRAINT "position_skills_pkey" PRIMARY KEY ("position_id","skill_id")
);

-- CreateTable
CREATE TABLE "employee_skills" (
    "employee_matricule" TEXT NOT NULL,
    "skill_id" TEXT NOT NULL,
    "proficiency_level" "ProficiencyLevel" NOT NULL,
    "acquired_date" DATE,
    "last_assessed_date" DATE,

    CONSTRAINT "employee_skills_pkey" PRIMARY KEY ("employee_matricule","skill_id")
);

-- CreateTable
CREATE TABLE "employee_positions" (
    "assignment_id" TEXT NOT NULL,
    "employee_matricule" TEXT NOT NULL,
    "position_id" TEXT NOT NULL,
    "assignment_type" "AssignmentType" NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "notes" TEXT,

    CONSTRAINT "employee_positions_pkey" PRIMARY KEY ("assignment_id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "contract_id" TEXT NOT NULL,
    "employee_matricule" TEXT NOT NULL,
    "contract_type" "ContractType" NOT NULL,
    "signed_date" DATE NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "trial_end_date" DATE,
    "base_salary_at_signing" INTEGER NOT NULL,
    "position_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "termination_date" DATE,
    "termination_reason" "TerminationReason",
    "document_reference" TEXT,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("contract_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employees_user_id_key" ON "Employees"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Employees_niu_number_key" ON "Employees"("niu_number");

-- CreateIndex
CREATE UNIQUE INDEX "Employees_cnps_number_key" ON "Employees"("cnps_number");

-- CreateIndex
CREATE UNIQUE INDEX "Employees_email_key" ON "Employees"("email");

-- CreateIndex
CREATE UNIQUE INDEX "employee_spouses_cni_number_key" ON "employee_spouses"("cni_number");

-- AddForeignKey
ALTER TABLE "Employees" ADD CONSTRAINT "Employees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company" ADD CONSTRAINT "company_parent_company_id_fkey" FOREIGN KEY ("parent_company_id") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_parent_department_id_fkey" FOREIGN KEY ("parent_department_id") REFERENCES "department"("department_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("department_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_spouses" ADD CONSTRAINT "employee_spouses_employee_matricule_fkey" FOREIGN KEY ("employee_matricule") REFERENCES "Employees"("employee_matricule") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_children" ADD CONSTRAINT "employee_children_employee_matricule_fkey" FOREIGN KEY ("employee_matricule") REFERENCES "Employees"("employee_matricule") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_children" ADD CONSTRAINT "employee_children_spouse_matricule_fkey" FOREIGN KEY ("spouse_matricule") REFERENCES "employee_spouses"("spouse_matricule") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_parents" ADD CONSTRAINT "employee_parents_employee_matricule_fkey" FOREIGN KEY ("employee_matricule") REFERENCES "Employees"("employee_matricule") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_employee_matricule_fkey" FOREIGN KEY ("employee_matricule") REFERENCES "Employees"("employee_matricule") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_credential" ADD CONSTRAINT "academic_credential_employee_matricule_fkey" FOREIGN KEY ("employee_matricule") REFERENCES "Employees"("employee_matricule") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "position_skills" ADD CONSTRAINT "position_skills_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "position_skills" ADD CONSTRAINT "position_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_skills" ADD CONSTRAINT "employee_skills_employee_matricule_fkey" FOREIGN KEY ("employee_matricule") REFERENCES "Employees"("employee_matricule") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_skills" ADD CONSTRAINT "employee_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_positions" ADD CONSTRAINT "employee_positions_employee_matricule_fkey" FOREIGN KEY ("employee_matricule") REFERENCES "Employees"("employee_matricule") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_positions" ADD CONSTRAINT "employee_positions_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_employee_matricule_fkey" FOREIGN KEY ("employee_matricule") REFERENCES "Employees"("employee_matricule") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "department"("department_id") ON DELETE RESTRICT ON UPDATE CASCADE;
