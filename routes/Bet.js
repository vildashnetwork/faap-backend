import express from 'express';
import Bet from '../models/Bet.js';
const router = express.Router();

// Place a new bet
router.post('/', async (req, res) => {
    try {
        const { userId, matchId, selection, stake, payout } = req.body;
        const newBet = new Bet({
            userId,
            matchId,
            selection,
            stake,
            payout
        });
        const savedBet = await newBet.save();
        res.status(201).json(savedBet);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

//get betslip by userid
router.get('/user/:userId', async (req, res) => {
    try {
        const bets = await Bet.find({ userId: req.params.userId });
        res.json(bets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//get all bet slips
router.get('/', async (req, res) => {
    try {
        const bets = await Bet.find();
        res.json(bets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Export the router
export default router;