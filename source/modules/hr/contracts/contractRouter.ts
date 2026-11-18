import { Router } from "express";
import { getContract, getContracts, getExpiringContracts } from "./contract";

const router = Router()

router.get("/", getContracts)
router.get("/expiring", getExpiringContracts) // must stay above /:contractId
router.get("/:contractId", getContract)

export default router
