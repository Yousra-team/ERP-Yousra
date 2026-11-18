import { Router } from "express";
import { requireRole } from "../../../lib/auth.middleware";
import { createDepartment, deleteDepartment, listChildDepartments, getDepartment, listDepartments, updateDepartment } from "./department";

const router = Router()

// Reads — anyone authenticated
router.get("/" , listDepartments)
router.get("/:departmentId", getDepartment)
router.get("/:departmentId/children", listChildDepartments)

// Writes — HR only
router.post("/" , requireRole(["HR"]), createDepartment)
router.patch("/:departmentId", requireRole(["HR"]), updateDepartment)
router.delete("/:departmentId", requireRole(["HR"]), deleteDepartment)

export default router
