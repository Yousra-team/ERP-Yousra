import dotenv from "dotenv";

import express from "express"
import hrRouter from "./modules/hr/hrRouter"
import authRouter from "./modules/auth/authRouter"
import userRouter from "./modules/admin/users/userRouter"
import companyRouter from "./modules/company/companyRouter"
import { requireAuth, requireRole } from "./lib/auth.middleware"

dotenv.config({
  path:['.env']
});

const app = express()

app.use(express.json())

// Public
app.use("/api/v1/auth", authRouter)

// Protected
app.use("/api/v1/hr", requireAuth, hrRouter)
app.use("/api/v1/admin/users", requireAuth, requireRole(["Admin", "HR"]), userRouter)

// Shared org structure — not HR
app.use("/api/v1/company", requireAuth, companyRouter)

// Health
app.get("/", (req, res) => {
    res.send("Yousra ERP API")
})

export default app
