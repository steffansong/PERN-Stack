import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import productRoutes from "./routes/productRoutes.js";
import { sql } from "./config/db.js";
import { aj } from "./lib/arcjet.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();


app.use(express.json());
app.use(cors());
app.use(helmet()); // helmet is a security middleware that helps protect apps by setting various HTTP headers
app.use(morgan("dev")); // log the requests


//apply arcjet rate-limit to all routes
app.use(async (req,res,next) => {
    try{
        const decision = await aj.protect(req, {
            requested: 1 // each request consumes 1 token
        })

        if (decision.isDenied()){
            if(decision.reason.isRateLimit()){
                res.status(429).json({
                    error:"Too Many Request"
                }) 
            } else if (decision.reason.isBot()) {
                res.status(403).json({
                    error:"Bot Access Denied."
                })
            } else {
                res.status(403).json({
                    error:"Forbidden."
                });
            }
            return
        }

        //check for spoofed bots
        if (decision.results.some((result) => result.reason.isBot() && result.reason.isSpoofed())){
            res.status(403).json({
                error:"Spoofed Bot Detected."
            })
            return;
        }

        next();
    } catch (error){
        console.log("Arcjet Error.", error);
        next(error);
    }
})

app.use("/api/products", productRoutes);

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "/frontend/dist")));

    app.get("*", (req,res) => {
        res.sendFile(path.resolve(__dirname,"frontend", "dist","index.html"));
    })
}

async function initDB(){
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS products(
                id SERIAL PRIMARY KEY,
                name varchar(255) NOT NULL,
                image varchar(255) NOT NULL,
                price decimal(10,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `
        console.log("Database initialised successfully.");
    } catch (error){
        console.log("Error initDB", error);
    }
};


initDB().then(()=> {
    app.listen(PORT, () => {
        console.log("Server is running on port " + PORT );
    }); 
});
