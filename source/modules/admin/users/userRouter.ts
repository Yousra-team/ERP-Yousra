import { Router } from "express";
import { createUser, getUserById, getUsers, updateUser } from "./user";

const router = Router()

router.post("/" , createUser)
router.get("/", getUsers)
router.get("/:userId", getUserById)
router.patch("/:userId", updateUser)