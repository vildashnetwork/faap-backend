import mongoose from 'mongoose';

const VoteSchema = new mongoose.Schema(
    {
        electionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
    },
    { timestamps: true }
);

const Vote = mongoose.model('Vote', VoteSchema);

export default Vote;