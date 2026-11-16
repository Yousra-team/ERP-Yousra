import { Router } from "express";
import { createUser, deleteUser, getUserById, getUsers, updateUser } from "./user";

const router = Router()

router.post("/" , createUser)
router.get("/", getUsers)
router.get("/:userId", getUserById)
router.patch("/:userId", updateUser)
router.delete("/:userId", deleteUser)

export default router