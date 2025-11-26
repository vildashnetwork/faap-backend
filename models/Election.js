import mongoose from "mongoose"

const electionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    candidates: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Candidate" }],
        validate: {
            // async validator: ensures none of the referenced Candidate docs are expired
            validator: async function (ids) {
                if (!ids || ids.length === 0) return true;
                const Candidate = mongoose.model("Candidate");
                const now = new Date();
                // Adjust the query below to match your Candidate schema.
                // This checks for either a boolean `expired: true` or an `expiresAt` date in the past.
                const expiredCount = await Candidate.countDocuments({
                    _id: { $in: ids },
                    $or: [
                        { expired: true },
                        { expiresAt: { $lte: now } }
                    ]
                });
                return expiredCount === 0;
            },
            message: "One or more candidates referenced in `candidates` are expired."
        }
    },
    startAt: {
        type: Date,
        required: true,
    },
    endAt: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['upcoming', 'active', 'closed'],
        default: 'upcoming',
        required: true,
    },
    eligibility: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const Election = mongoose.model("Election", electionSchema);

export default Election;