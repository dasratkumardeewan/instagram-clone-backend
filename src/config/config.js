import dotenv from 'dotenv'
dotenv.config()

if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in the environment variables')
}

if (!process.env.PORT) {
    throw new Error('PORT is not defined in the environment variables')
}

if (!process.env.CORS_ORIGIN) {
    throw new Error('CORS_ORIGIN is not defined in the environment variables')
}

if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error('ACCESS_TOKEN_SECRET is not defined in the environment variables')
}

if (!process.env.ACCESS_TOKEN_EXPIRY) {
    throw new Error('ACCESS_TOKEN_EXPIRY is not defined in the environment variables')
}

if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error('REFRESH_TOKEN_SECRET is not defined in the environment variables')
}

if (!process.env.REFRESH_TOKEN_EXPIRY) {
    throw new Error('REFRESH_TOKEN_EXPIRY is not defined in the environment variables')
}

if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error('CLOUDINARY_CLOUD_NAME is not defined in the environment variables')
}

if (!process.env.CLOUDINARY_API_KEY) {
    throw new Error('CLOUDINARY_API_KEY is not defined in the environment variables')
}

if (!process.env.CLOUDINARY_API_SECRET) {
    throw new Error('CLOUDINARY_API_SECRET is not defined in the environment variables')
}


//CLOUDINARY_CLOUD_NAME
//CLOUDINARY_API_KEY
//CLOUDINARY_API_SECRET

const config = {
    port: process.env.PORT || 3000,
    mongodb_uri: process.env.MONGODB_URI,
    cors_origin: process.env.CORS_ORIGIN || '*',
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY,
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET
}

export default config