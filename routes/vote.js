import express from 'express';
import mongoose from 'mongoose';
import Vote from '../models/Vote.js';
const router = express.Router();

/* Vote model (included here per request) */

/* Helpers */
const handleError = (res, err) => res.status(500).json({ error: err.message || 'Server error' });

/* Create a vote — prevents duplicate voting by same user in the same election */
router.post('/', async (req, res) => {
    try {
        const { electionId, userId, candidateId } = req.body;
        if (!electionId || !userId || !candidateId) {
            return res.status(400).json({ error: 'electionId, userId and candidateId are required' });
        }

        const existing = await Vote.findOne({ electionId, userId });
        if (existing) {
            return res.status(400).json({ error: 'User already voted in this election' });
        }

        const vote = new Vote({ electionId, userId, candidateId });
        await vote.save();
        const populated = await vote.populate(['electionId', 'userId', 'candidateId']).execPopulate?.() ?? vote;
        res.status(201).json(populated);
    } catch (err) {
        handleError(res, err);
    }
});

/* List votes — supports filtering by query params */
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.electionId) filter.electionId = req.query.electionId;
        if (req.query.userId) filter.userId = req.query.userId;
        if (req.query.candidateId) filter.candidateId = req.query.candidateId;

        const votes = await Vote.find(filter).populate(['electionId', 'userId', 'candidateId']).sort({ createdAt: -1 });
        res.json(votes);
    } catch (err) {
        handleError(res, err);
    }
});

/* Get single vote */
router.get('/:id', async (req, res) => {
    try {
        const vote = await Vote.findById(req.params.id).populate(['electionId', 'userId', 'candidateId']);
        if (!vote) return res.status(404).json({ error: 'Vote not found' });
        res.json(vote);
    } catch (err) {
        handleError(res, err);
    }
});

/* Update a vote — only allow changing candidateId (to avoid reassigning election/user) */
router.put('/:id', async (req, res) => {
    try {
        const { candidateId } = req.body;
        if (!candidateId) return res.status(400).json({ error: 'candidateId is required to update' });

        const vote = await Vote.findById(req.params.id);
        if (!vote) return res.status(404).json({ error: 'Vote not found' });

        vote.candidateId = candidateId;
        await vote.save();
        const populated = await vote.populate(['electionId', 'userId', 'candidateId']).execPopulate?.() ?? vote;
        res.json(populated);
    } catch (err) {
        handleError(res, err);
    }
});

/* Delete a vote */
router.delete('/:id', async (req, res) => {
    try {
        const vote = await Vote.findByIdAndDelete(req.params.id);
        if (!vote) return res.status(404).json({ error: 'Vote not found' });
        res.json({ message: 'Vote deleted' });
    } catch (err) {
        handleError(res, err);
    }
});

/* Election results: counts per candidate for a given electionId */
router.get('/results/:electionId', async (req, res) => {
    try {
        const { electionId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(electionId)) {
            return res.status(400).json({ error: 'Invalid electionId' });
        }

        const results = await Vote.aggregate([
            { $match: { electionId: mongoose.Types.ObjectId(electionId) } },
            { $group: { _id: '$candidateId', votes: { $sum: 1 } } },
            { $sort: { votes: -1 } },
        ]);

        res.json(results);
    } catch (err) {
        handleError(res, err);
    }
});

export default router;