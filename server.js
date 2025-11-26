import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import env from "dotenv";
import cron from "node-cron";
import fetch from "node-fetch";
import adminlogin from "./routes/adminlogin.js";
import election from "./routes/election.js";
import votes from "./routes/vote.js";
import events from "./routes/event.js";
import candidates from './routes/cndidates.js';
import userlogin from "./routes/userloging.js";
import bet from "./routes/Bet.js";

env.config();

const app = express();

// logging + security middlewares
app.use(helmet());
app.use(morgan(":method :url :status :response-time ms - :res[content-length]"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- keep Render alive ---
const URL = "https://wicikibackend.onrender.com/ping";
function scheduleRandomPing() {
    const minutes = Math.floor(Math.random() * 11) + 5; // every 5–15 mins
    cron.schedule(`*/${minutes} * * * *`, async () => {
        try {
            await fetch(URL);
            console.log("pinged");
        } catch (e) {
            console.error("ping failed", e.message);
        }
    });
}
scheduleRandomPing();

// --- CORS: apply before routes ---
const allowedOrigins = [
    "http://localhost:8081",
    "http://localhost:8080",
    "https://fitmat-hub-admin.onrender.com",
    "https://fitmat-campus-hub.onrender.com"
];

app.use(
    cors({
        origin(origin, callback) {
            // allow requests with no origin (like mobile apps, curl)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            return callback(new Error("Not allowed by CORS"));
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true, // set to true only if you need cookies/auth cross-origin
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    })
);

// If you want a simple response to OPTIONS for every route (safe to include)
app.options("*", cors());

// --- routes (after cors) ---
app.use("/api/admin", adminlogin);
app.use("/elect", election);
app.use("/vote", votes);
app.use("/api/user", userlogin);
app.use("/events", events);
app.use("/candidates", candidates);
app.use("/bet", bet);

app.get("/", (req, res) => {
    res.send("server is on");
});

const PORT = process.env.PORT || 6000;

// database connection and server start
const connectdb = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        if (conn) console.log("database connected successfully!!");
    } catch (err) {
        console.error("error connecting to the database: " + err);
    }
};

connectdb().then(() => {
    app.listen(PORT, () => {
        console.log(`server running on http://127.0.0.1:${PORT}`);
    });
});
