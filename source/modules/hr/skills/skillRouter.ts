import { Router } from "express";
import { requireRole } from "../../../lib/auth.middleware";
import { createSkill, deleteSkill, getSkill, listSkills, updateSkill } from "./skill";

// the skill catalog, employees and positions point at these rows

const router = Router()

// Skills
router.get("/" , listSkills)
router.get("/:id", getSkill)
router.post("/" , requireRole(["HR"]), createSkill)
router.patch("/:id", requireRole(["HR"]), updateSkill)
router.delete("/:id", requireRole(["HR"]), deleteSkill)

export default router
