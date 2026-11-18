import { Router } from "express";
import { createSkill, deleteSkill, getSkill, getSkills, updateSkill } from "./skill";

const router = Router()

router.post("/" , createSkill)
router.get("/", getSkills)
router.get("/:id", getSkill)
router.patch("/:id", updateSkill)
router.delete("/:id", deleteSkill)

export default router
