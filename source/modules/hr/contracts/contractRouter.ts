import { Router } from "express";
import { getContractById, listAllContracts, listExpiringContracts } from "./contract";

const router = Router()

// Contracts (reads only)
router.get("/" , listAllContracts)
router.get("/expiring", listExpiringContracts) // must stay above /:contractId or express reads "expiring" as an id
router.get("/:contractId", getContractById)

export default router
