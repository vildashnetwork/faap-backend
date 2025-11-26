import mongoose from "mongoose"

const candidateSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        manifesto: { type: String, required: true, maxlength: 500 },
        photo: { type: String, required: true },
        color: { type: String },
        colorIndex: { type: Number, default: 0 },
        bg: { type: String },
        // remove persisted 'expired' field; compute it from createdAt
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// virtual 'expired' becomes true one year after creation
candidateSchema.virtual('expired').get(function () {
    if (!this.createdAt) return false;
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    return Date.now() - this.createdAt.getTime() >= oneYearMs;
});

const Candidate = mongoose.model("Candidate", candidateSchema);

export default Candidate;