import { Router } from "express";
import { createPost, deletePost, getAllPosts, getPostById } from "../controllers/post.controller.js";
import upload from "../middleware/multer.middleware.js";
import verifyJWT from "../middleware/auth.middleware.js";

const router = Router()

router.route("/create-post").post(verifyJWT, upload.single("post"), createPost)
router.route("/get-post-by-id/:postId").get(verifyJWT, getPostById)
router.route("/get-all-posts").get(verifyJWT, getAllPosts)
router.route("/delete-post-by-id/:postId").delete(verifyJWT, deletePost)
export default router