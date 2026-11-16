import express from "express"
import hrRouter from "./modules/hr/hrRouter"
import authRouter from "./modules/auth/authRouter"
import userRouter from "./modules/admin/users/userRouter"
import { requireAuth, requireRole } from "./lib/auth.middleware"

const app = express()

app.use(express.json())

app.use("/api/v1/auth", authRouter) // public endpoints inside
app.use("/api/v1/hr/employees", requireAuth, hrRouter)
app.use("/api/v1/admin/users", requireAuth, requireRole(["Admin", "HR"]), userRouter)

app.get("/", (req, res) => {
    res.send("Yousra ERP API")
})

export default app
