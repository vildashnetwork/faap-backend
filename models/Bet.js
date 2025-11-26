import mongoose from "mongoose"
import Event from "./Events.js"

const Betschema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        trim: true
    },
    matchId: {
        type: String,
        required: true,
        trim: true
    },
    selection: {
        type: String,
        enum: ['home', 'draw', 'away'],
        required: true,
        trim: true
    },
    stake: {
        type: Number,
        required: true
    },
    payout: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'won', 'lost', 'voided'],
        required: true,
        trim: true
    }
},
    { timestamps: true });

// Middleware to update bet status based on event result
Betschema.pre('save', async function (next) {
    if (this.status !== 'pending') return next();

    try {
        const event = await Event.findById(this.matchId);
        if (!event || event.status !== 'finished') return next();

        const winner = event.score.home > event.score.away ? 'home' :
            event.score.away > event.score.home ? 'away' : 'draw';

        this.status = this.selection === winner ? 'won' : 'lost';
        next();
    } catch (err) {
        next(err);
    }
});

const Bet = mongoose.model("Bet", Betschema);

export default Bet;