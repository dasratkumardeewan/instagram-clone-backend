import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import User from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, fullName, bio } = req.body

    if ([username, email, password, fullName].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (existedUser.username === username) {
        throw new ApiError(409, "Username is already taken")
    }
    if (existedUser.email === email) {
        throw new ApiError(409, "User with this email already exists")
    }

    const profileImageLocalPath = req.file?.path;
    let profileImage;

    if (profileImageLocalPath) {
        profileImage = await uploadOnCloudinary(profileImageLocalPath)

        if (!profileImage) {
            throw new ApiError(500, "Something went wrong while uploading your image")
        }
    }

    const updatedUsername = username.toLowerCase().replace(" ", "_")

    const user = await User.create({
        username: updatedUsername,
        fullName,
        email,
        password,
        profileImage: {
            url: profileImage.secure_url,
            public_id: profileImage.public_id
        },
        bio,
        isVerified: true
    })

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    return res.status(201).json(
        new ApiResponse(201, loggedInUser, "User registered Successfully")
    )

})

export {
    registerUser
}