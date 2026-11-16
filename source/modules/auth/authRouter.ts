import { Router } from "express";
import { changePassword, UserLogin } from "./auth";

const router = Router()

router.post("/login", UserLogin)
router.post("/change-password", changePassword)