import { Router } from "express";
import companiesRouter from "./companies/companyRouter";
import departmentsRouter from "./departments/departmentRouter";

// shared org structure, finance / stock / inventory will use it too so it stays out of hr/

const router = Router()

// Sub-routers — each lives in its own folder under source/modules/company/
router.use("/companies", companiesRouter)
router.use("/departments", departmentsRouter)

export default router
