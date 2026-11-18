import { Router } from "express";
import { createCompany, deleteCompany, getCompanies, getCompany, updateCompany } from "./company";

const router = Router()

router.post("/" , createCompany)
router.get("/", getCompanies)
router.get("/:id", getCompany)
router.patch("/:id", updateCompany)
router.delete("/:id", deleteCompany)

export default router
