import mongoose from "mongoose"

const eventSchema = new mongoose.Schema({
    tournament: {
        type: String,
        required: true
    },
    homeTeam: {
        type: String,
        required: true
    },
    awayTeam: {
        type: String,
        required: true
    },
    startAt: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['upcoming', 'live', 'finished'],
        required: true
    },
    odds: {
        home: Number,
        draw: Number,
        away: Number
    },
    score: {
        home: Number,
        away: Number
    },
    two: String,
    one: String,
    bg: String,
    startingTime: {
        type: Date,
        required: false
    },
    duration: {
        type: String,
        required: false
    },
    endTime: {
        type: Date,
        required: false
    },
    isended: {
        type: Boolean,
        default: false
    }
},
    { timestamps: true })

// Middleware to update status before saving
eventSchema.pre('save', function (next) {
    const now = new Date();
    if (this.isended) {
        this.status = "finished"
    } else if (now >= this.startingTime && now < this.endTime) {
        this.status = "live"
    } else {
        this.status = "upcoming"
    }
    next();
})

// Instance method to get current status
eventSchema.methods.getCurrentStatus = function () {
    const now = new Date();
    if (this.isended) return "finished";
    if (now >= this.startingTime && now < this.endTime) return "live";
    return "upcoming";
}

const Event = mongoose.model('Event', eventSchema);
export default Event;