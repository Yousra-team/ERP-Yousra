import express from "express"

const app = express()

app.use("/", (req,res) => {
    res.send("Welcome to Yousra ERP made with ❤️ by Yousra Company")
})

export default app