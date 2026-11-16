import { Router } from "express";
import { changePassword, loginEmployee } from "./auth";

const router = Router()

router.post("/login", loginEmployee)
router.post("/change-password", changePassword)