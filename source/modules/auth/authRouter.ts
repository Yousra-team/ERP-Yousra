import { Router } from "express";
import { changePassword, loginEmployee } from "./auth";
import { requireAuth } from "../../lib/auth.middleware";

const router = Router()

router.post("/login", loginEmployee)
router.post("/change-password", requireAuth, changePassword)

export default router
