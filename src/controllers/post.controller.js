import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import User from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import Post from "../models/post.model.js";
import mongoose from "mongoose";

const createPost = asyncHandler(async (req, res) => {
    const postLocalPath = req.file?.path
    const { title, description } = req.body

    if ([title, description].some((field) => field.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }
    if (!postLocalPath) {
        throw new ApiError(400, "Post Url Is Missing")
    }

    const postServer = await uploadOnCloudinary(postLocalPath)
    if (!postServer) {
        throw new ApiError(500, "Something went wrong while uploading your post")
    }

    if (!req.user._id) {
        throw new ApiError(403, "Unauthorized Request")
    }

    const post = await Post.create({
        title,
        description,
        postFile: {
            url: postServer.secure_url,
            public_id: postServer.public_id
        },
        owner: req.user._id
    })

    return res.status(201).json(
        new ApiResponse(201, post, "Post Uploaded successfully")
    )

})

const getPostById = asyncHandler(async (req, res) => {
    const { postId } = req.params
    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid postId")
    }


    const post = await Post.findById(postId)

    if (!post) {
        throw new ApiError(404, "No post found")
    }
    if (req.user._id.toString() !== post.owner.toString()) {
        throw new ApiError(403, "Unauthorized Request")
    }

    return res.status(200).json(
        new ApiResponse(200, post, "Post Fetched Successfully")
    )
})

const getAllPosts = asyncHandler(async (req, res) => {
    const posts = await Post.find({})
        .populate("owner", "username avatar fullName")
        .sort({ createdAt: -1 })

    return res.status(200).json(
        new ApiResponse(200, posts, "Posts fetched successfully")
    )
})

const deletePost = asyncHandler(async (req, res) => {
    const { postId } = req.params
    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid postId")
    }


    const post = await Post.findByIdAndDelete(postId)

    if (!post) {
        throw new ApiError(404, "No post found")
    }
    if (req.user._id.toString() !== post.owner.toString()) {
        throw new ApiError(403, "Unauthorized Request")
    }

    return res.status(200).json(
        new ApiResponse(200, post, "Post Deleted Successfully")
    )
})

export {
    createPost,
    getPostById,
    getAllPosts,
    deletePost
}