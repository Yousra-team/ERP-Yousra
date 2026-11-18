import express from "express"
import hrRouter from "./modules/hr/hrRouter"
import authRouter from "./modules/auth/authRouter"
import userRouter from "./modules/admin/users/userRouter"
import companyRouter from "./modules/companies/companyRouter"
import departmentRouter from "./modules/companies/departments/departmentRouter"
import positionRouter from "./modules/hr/positions/positionRouter"
import skillRouter from "./modules/hr/skills/skillRouter"
import contractRouter from "./modules/hr/contracts/contractRouter"
import { requireAuth, requireRole } from "./lib/auth.middleware"

const app = express()

app.use(express.json())

app.use("/api/v1/auth", authRouter) // public endpoints inside
app.use("/api/v1/hr/employees", requireAuth, hrRouter)
app.use("/api/v1/admin/users", requireAuth, requireRole(["Admin", "HR"]), userRouter)
app.use("/api/v1/companies", requireAuth, companyRouter)
app.use("/api/v1/departments", requireAuth, departmentRouter)
app.use("/api/v1/positions", requireAuth, positionRouter)
app.use("/api/v1/skills", requireAuth, skillRouter)
app.use("/api/v1/contracts", requireAuth, contractRouter)

app.get("/", (req, res) => {
    res.send("Yousra ERP API")
})

export default app
