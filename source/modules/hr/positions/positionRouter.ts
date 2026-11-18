import { Router } from "express";
import { addPositionSkill, createPosition, deletePosition, deletePositionSkill, getHolders, getPosition, getPositions, getPositionSkills, getSubordinates, updatePosition, updatePositionSkill } from "./position";

const router = Router()

router.post("/" , createPosition)
router.get("/", getPositions)
router.get("/:id", getPosition)
router.get("/:id/subordinates", getSubordinates)
router.get("/:id/holders", getHolders)
router.patch("/:id", updatePosition)
router.delete("/:id", deletePosition)

// Position skills
router.get("/:id/skills", getPositionSkills)
router.post("/:id/skills", addPositionSkill)
router.patch("/:id/skills/:skillId", updatePositionSkill)
router.delete("/:id/skills/:skillId", deletePositionSkill)

export default router
