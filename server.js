
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import env from "dotenv";
import cron from "node-cron";
import fetch from "node-fetch"; // optional: Node 18+ has global fetch
import adminlogin from "./routes/adminlogin.js";
import election from "./routes/election.js";
import votes from "./routes/vote.js";
import events from "./routes/event.js";
import candidates from "./routes/cndidates.js";
import userlogin from "./routes/userloging.js";
import bet from "./routes/Bet.js";
import request from "./routes/candidaterequest.js"

env.config();

const app = express();

app.use(helmet());
app.use(morgan(":method :url :status :response-time ms - :res[content-length]"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- keep Render alive (if needed) ---
const URL = "https://wicikibackend.onrender.com/ping";
function scheduleRandomPing() {
    const minutes = Math.floor(Math.random() * 11) + 5;
    cron.schedule(`*/${minutes} * * * *`, async () => {
        try {
            await fetch(URL);
            console.log("pinged");
        } catch (e) {
            console.error("ping failed", e?.message ?? e);
        }
    });
}
scheduleRandomPing();

// --- CORS (apply BEFORE routes) ---
const allowedOrigins = [
    "http://localhost:8081",
    "http://localhost:8080",
    "https://fitmat-hub-admin.onrender.com",
    "https://fitmat-campus-hub.onrender.com"
];

app.use(
    cors({
        origin(origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            return callback(new Error("Not allowed by CORS"));
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
        credentials: true,
        optionsSuccessStatus: 204
    })
);

// NOTE: removed `app.options("*", cors())` because '*' caused path-to-regexp errors in this environment.
// If you want an explicit options handler, use a valid pattern like '/*' or rely on the global CORS middleware.

// health check
app.get("/", (req, res) => res.send("server is on"));

// routes (after CORS)
app.use("/api/admin", adminlogin);
app.use("/elect", election);
app.use("/vote", votes);
app.use("/api/user", userlogin);
app.use("/events", events);
app.use("/candidates", candidates);
app.use("/bet", bet);
app.use("/api/request", request)

const PORT = process.env.PORT || 6000;

const connectdb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("database connected successfully!!");
    } catch (err) {
        console.error("error connecting to the database: " + err);
        process.exit(1);
    }
};

connectdb().then(() => {
    app.listen(PORT, () => {
        console.log(`server running on http://127.0.0.1:${PORT}`);
    });
});
