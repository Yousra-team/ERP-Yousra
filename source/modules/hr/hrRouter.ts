import { Router } from "express";
import employeeRouter from "./employees/employeeRouter";
import positionRouter from "./positions/positionRouter";
import skillRouter from "./skills/skillRouter";
import contractRouter from "./contracts/contractRouter";

const router = Router()

// Sub-routers — each lives in its own folder under source/modules/hr/
router.use("/employees", employeeRouter)
router.use("/positions", positionRouter)
router.use("/skills", skillRouter)
router.use("/contracts", contractRouter)

export default router
