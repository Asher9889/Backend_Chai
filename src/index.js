import { app } from './app.js';
import connectDB from "./db/index.js";


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000 , ()=>{
        console.log(`app is listening from port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("error found in main index file during mongoDB connection", err)
})