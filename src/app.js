import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import config from './config/config.js'

const app = express()

// Configurations

app.use(cors({ origin: config.cors_origin, credentials: true }))
app.use(express.json({ limit: "15kb" }))
app.use(express.urlencoded({ extended: true, limit: "15kb" }))
app.use(express.static("./public"))
app.use(cookieParser())

// Route Imports
import userRouter from './routes/user.route.js'

// Route declarations

app.use("/v1/api/auth",userRouter)


export default app