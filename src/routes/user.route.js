import { Router } from "express";
import { changeCurrentPassword, loginUser, logout, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import upload from '../middleware/multer.middleware.js'
import verifyJWT from "../middleware/auth.middleware.js";

const router = Router()

router.route("/register").post(upload.single("profileImage"), registerUser)
router.route("/login").post(loginUser)


// Secured Routes

router.route("/logout").post(verifyJWT,logout)
router.route("/refresh-access-token").patch(verifyJWT,refreshAccessToken)
router.route("/change-current-password").patch(verifyJWT,changeCurrentPassword)

export default router