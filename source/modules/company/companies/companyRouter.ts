import { Router } from "express";
import { requireRole } from "../../../lib/auth.middleware";
import { createCompany, listCompanies, getCompany, updateCompany, deleteCompany } from "./company";

const router = Router()

// Reads — anyone authenticated
router.get("/" , listCompanies)
router.get("/:id", getCompany)

// Writes — HR only (HR owns the data even though it isn't under hr/)
router.post("/" , requireRole(["HR", "ADMIN"]), createCompany)
router.patch("/:id", requireRole(["HR", "ADMIN"]), updateCompany)
router.delete("/:id", requireRole(["HR", "ADMIN"]), deleteCompany)

export default router
