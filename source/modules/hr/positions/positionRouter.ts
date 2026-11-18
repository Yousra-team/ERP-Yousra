import { Router } from "express";
import { requireRole } from "../../../lib/auth.middleware";
import { createPosition, deletePosition, getPosition, listHolders, listPositions, listSubordinates, updatePosition } from "./position";
import { addPositionSkill, listPositionSkills, removePositionSkill, updatePositionSkill } from "./position-skills/positionSkill";

const router = Router()

// Positions
router.get("/" , listPositions)
router.get("/:id", getPosition)
router.get("/:id/subordinates", listSubordinates)
router.get("/:id/holders", listHolders)
router.post("/" , requireRole(["HR"]), createPosition)
router.patch("/:id", requireRole(["HR"]), updatePosition)
router.delete("/:id", requireRole(["HR"]), deletePosition)

// Position skills
router.get("/:id/skills", listPositionSkills)
router.post("/:id/skills", requireRole(["HR"]), addPositionSkill)
router.patch("/:id/skills/:skillId", requireRole(["HR"]), updatePositionSkill)
router.delete("/:id/skills/:skillId", requireRole(["HR"]), removePositionSkill)

export default router
