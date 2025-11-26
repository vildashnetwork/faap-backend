import mongoose from "mongoose";

const requestToBeCandidateSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        manifesto: { type: String, required: true, maxlength: 500 },
        photo: { type: String, required: true },
        color: { type: String },
        colorIndex: { type: Number, default: 0 },
        bg: { type: String },

        aboutyourteam: [
            {
                memberName: { type: String, required: true },
                memberRole: { type: String, required: true },
                Info: { type: String, required: true },
                memberPhoto: { type: String, required: true },
            }
        ],

        email: { type: String, required: true },
        approved: { type: Boolean, default: false }
    },
    { timestamps: true }
);

const RequestToBeCandidate = mongoose.model("RequestToBeCandidate", requestToBeCandidateSchema);

export default RequestToBeCandidate;