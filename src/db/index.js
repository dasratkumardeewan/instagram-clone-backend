import dns from 'dns';
import mongoose from 'mongoose';
import { DB_NAME } from '../constant.js';
import config from '../config/config.js';


dns.setServers(['8.8.8.8', '8.8.4.4']);



const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${config.mongodb_uri}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1)
    }
}

export default connectDB