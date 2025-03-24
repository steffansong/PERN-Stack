import arcjet, {tokenBucket, shield, detectBot} from "@arcjet/node";

import "dotenv/config";



export const aj = arcjet({
    key: process.env.ARCJET_KEY,
    characteristics:["ip.src"],
    rules: [
        // DRY RUN mode only logs requests
        // Shield protects your app from common attacks e.g. SQL injection
        shield({mode:"LIVE"}),
        detectBot({
            mode:"LIVE",
            // Block all bots except the following
        allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        ]
        }),
        //rate limiting
        tokenBucket({
            mode:"LIVE",
            refillRate: 5, //  refill 5 tokens per interval
            interval: 10, //  refill every 10 seconds
            capacity:10,  //    Bucket capacity of 10 tokens
        }),
    ]
}
)