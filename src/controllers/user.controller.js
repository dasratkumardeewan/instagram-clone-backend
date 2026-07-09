import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import User from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import config from "../config/config.js";
import { v2 as cloudinary } from "cloudinary"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const refreshToken = user.generateRefreshToken()
        const accessToken = user.generateAccessToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { refreshToken, accessToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating your tokens. error: ", error.message || error)
    }
}


const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, fullName, bio } = req.body

    if ([username, email, password, fullName].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (existedUser) {
        if (existedUser.username === username) {
            throw new ApiError(409, "Username is already taken")
        }
        if (existedUser.email === email) {
            throw new ApiError(409, "User with this email already exists")
        }
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
        bio: bio || "",
        isVerified: true
    })

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    return res.status(201).json(
        new ApiResponse(201, loggedInUser, "User registered Successfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body

    if (!(email || username)) {
        throw new ApiError(400, "Username or email is required")
    }

    if (!password || password.trim() === "") {
        throw new ApiError(400, "Password is required")
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (!existedUser) {
        throw new ApiError(404, "User not found")
    }

    const isPasswordValid = await existedUser.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(existedUser._id)

    const loggedInUser = await User.findById(existedUser._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }



    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, { loggedInUser, accessToken: accessToken, refreshToken: refreshToken }, "User logged in successfully")
        )

})

const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: null
        }
    }, {
        new: true
    })

    const options = {
        httpOnly: true,
        secure: true

    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, req.user._id, "User Logged out successfully")
        )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const token = req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ", "")

        // console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }

        const decodedToken = jwt.verify(token, config.refreshTokenSecret)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) {

            throw new ApiError(401, "Invalid Refresh Token")
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, { accessToken: accessToken, refreshToken: refreshToken }, "Access Token Refreshed Successfully")
            )

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }


})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    if ([oldPassword, newPassword].some((field) => { !field || field.trim() === "" })) {
        throw new ApiError(400, "All Fields are required")
    }

    const user = await User.findById(req.user._id)

    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordValid) {
        throw new ApiError(409, "Invalid Credentials")
    }

    user.password = newPassword
    await user.save()

    return res.status(200).json(
        new ApiResponse(200, { user }, "Current Password Changed Successfully")
    )
})

const updateUserInfo = asyncHandler(async (req, res) => {
    const { bio, fullName, username } = req.body

    if (!(bio || fullName || username)) {
        throw new ApiError(400, "Atleast one field is must to be provided")
    }
    const fieldsToBeUpdated = {}

    if (bio) {
        fieldsToBeUpdated.bio = bio
    }
    if (fullName) {
        fieldsToBeUpdated.fullName = fullName
    }

    if (username) {
        const existedUserWithUsername = await User.findOne({ username })

        if (existedUserWithUsername) {
            throw new ApiError(400, "Username is already taken ")
        }
        fieldsToBeUpdated.username = username
    }

    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: fieldsToBeUpdated
    }, {
        new: true
    })

    return res.status(200).json(
        new ApiResponse(200, user, "User info updated successfully")
    )


})

const changeCurrentEmail = asyncHandler(async (req, res) => {
    const { password, email } = req.body

    if ([password, email].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, `All fields are required`)
    }

    const existedUserWithEmail = await User.findOne({ email })

    if (existedUserWithEmail) {
        throw new ApiError(400, "User with this email already exists")
    }

    const user = await User.findById(req.user._id)

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(409, "Invalid Credentials")
    }

    user.email = email
    await user.save()

    return res.status(200).json(
        new ApiResponse(200, user, "User email updated successfully")
    )
})

const updateProfileImage = asyncHandler(async (req, res) => {
    const profileImageLocalPath = req.file?.path

    if (!profileImageLocalPath) {
        throw new ApiError(400, "Profile Image is missing")
    }

    const profileImage = await uploadOnCloudinary(profileImageLocalPath)

    if (!profileImage) {
        throw new ApiError(500, "Something went wrong while uploading your image")
    }

    const user = await User.findById(req.user._id)
    // console.log(user.profileImage.public_id)
    // await cloudinary.uploader.destroy(user.profileImage.public_id)

    user.profileImage.url = profileImage.secure_url
    user.profileImage.public_id = profileImage.public_id
    user.save()

    return res.status(200).json(
        new ApiResponse(200, user, "Profile Image updated successfully")
    )
})

const getCurrentUser = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id).select()

    return res.status(200).json(
        new ApiResponse(200, user, "User fetched Successfully")
    )

})

const deleteAccount = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.user._id)

    return res.status(200).json(
        new ApiResponse(200, { userId: user._id }, "Account deleted successfully")
    )
})
export {
    registerUser,
    loginUser,
    logout,
    refreshAccessToken,
    changeCurrentPassword,
    updateUserInfo,
    changeCurrentEmail,
    updateProfileImage,
    getCurrentUser,
    deleteAccount
}