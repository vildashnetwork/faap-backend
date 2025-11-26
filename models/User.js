import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    studentId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student',
        trim: true
    },
    balance: {
        type: Number,
        default: 0
    },
    age: {
        type: Number,
        min: 0
    },
    verified: {
        type: Boolean,
        default: true
    },
    profile: {
        type: String,
        trim: true,
        default: ""
    },
    phone: {
        type: String,
        trim: true,
        required: true,
        unique: true
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;