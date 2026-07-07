import connectDB from "./db/index.js";
import app from "./app.js";
import config from "./config/config.js";

connectDB()
.then(()=>{
    app.listen(config.port,()=>{
        console.log('The App is listening on port: ',config.port)
    })
})
.catch((error)=>{
throw new Error("MongoDB Connection Failed")
})