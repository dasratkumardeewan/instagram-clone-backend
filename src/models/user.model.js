import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import config from '../config/config.js'

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required:true
        },
        username: {
            type: String,
            unique: true,
            trim: true,
            lowercase: true,
            required: [true, "Username is required"],
            minlength: [3, "Username must be at least 3 characters"],
            maxlength: [30, "Username cannot exceed 30 characters"],
            match: [
                /^(?!.*\.\.)(?!.*\.$)[a-z0-9._]{3,30}$/,
                "Invalid username format",
            ],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\S+@\S+\.\S+$/,
                "Please enter a valid email address",
            ],
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"],
            maxlength: [128, "Password cannot exceed 128 characters"],
        },
        bio: {
            type: String,
            trim: true,
            maxlength: [150, "Bio cannot exceed 150 characters"],
            default: "",
        },
        profileImage: {
            url: {
                type: String,
                default: ""
            },
            public_id: {
                type: String,
                default: ""
            }
        },
        posts: {
            type: Number,
            default: 0
        },
        follower: {
            type: Number,
            default: 0
        },
        following: {
            type: Number,
            default: 0
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        isPrivate: {
            type: Boolean,
            default: false
        },
        isActive: {
            type: Boolean,
            default: false
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    })

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    }, config.accessTokenSecret, { expiresIn: config.accessTokenExpiry })
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id
    }, config.refreshTokenSecret, { expiresIn: config.refreshTokenExpiry })
}


const User = mongoose.model("User", userSchema)
export default User