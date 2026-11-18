import { Router } from "express";
import { createDepartment, deleteDepartment, getChildDepartments, getDepartment, getDepartments, updateDepartment } from "./department";

const router = Router()

router.post("/" , createDepartment)
router.get("/", getDepartments)
router.get("/:departmentId", getDepartment)
router.get("/:departmentId/children", getChildDepartments)
router.patch("/:departmentId", updateDepartment)
router.delete("/:departmentId", deleteDepartment)

export default router
