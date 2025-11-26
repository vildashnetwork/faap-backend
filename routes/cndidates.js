import express from "express";
import mongoose from "mongoose";
import RequestToBeCandidate from "../models/requesttobeCandidate.js";
import Candidate from "../models/Candidate.js";

const router = express.Router();

// POST: User requests to become a candidate
router.post("/requests", async (req, res) => {
    try {
        const { name, manifesto, photo, color, colorIndex, bg, aboutyourteam, email } = req.body;

        const reqDoc = new RequestToBeCandidate({
            name,
            manifesto,
            photo,
            color,
            colorIndex,
            bg,
            aboutyourteam,
            email,
        });

        const saved = await reqDoc.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET: All requests (pending or approved)
router.get("/requests", async (req, res) => {
    try {
        const requests = await RequestToBeCandidate.find().sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Approve a request and create candidate
router.post("/requests/:id/approve", async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const request = await RequestToBeCandidate.findById(req.params.id).session(session);
        if (!request) return res.status(404).json({ error: "Request not found" });
        if (request.approved) return res.status(400).json({ error: "Already approved" });

        const candidateDoc = new Candidate({
            name: request.name,
            manifesto: request.manifesto,
            photo: request.photo,
            color: request.color,
            colorIndex: request.colorIndex,
            bg: request.bg,
        });

        await session.withTransaction(async () => {
            await candidateDoc.save({ session });
            request.approved = true;
            await request.save({ session });
        });

        res.json({ message: "Request approved", candidate: candidateDoc });
    } catch (err) {
        res.status(400).json({ error: err.message });
    } finally {
        session.endSession();
    }
});

// GET: All candidates
router.get("/candidates", async (req, res) => {
    try {
        const candidates = await Candidate.find().sort({ createdAt: -1 });
        res.json(candidates);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE: Candidate
router.delete("/candidates/:id", async (req, res) => {
    try {
        const removed = await Candidate.findByIdAndDelete(req.params.id);
        if (!removed) return res.status(404).json({ error: "Candidate not found" });
        res.json({ message: "Candidate deleted" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
