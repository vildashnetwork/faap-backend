import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import decodeTokenFromReq from "./decode.js";
import User from "../models/User.js";

dotenv.config();
const router = express.Router();
const SALT_ROUNDS = 10;

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, name: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "15d" }
    );
};


const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

//register user
router.post("/register", async (req, res) => {
    try {
        // extract fields and normalize interest to an array of strings
        let {
            name,
            email,
            password,
            profile,
            studentId,
            role,
            balance,
            age,
            phone } = req.body;
        if (!name || !email ||
            !password ||

            !studentId ||
            !phone ||
            !balance ||
            !age
        ) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // Validate email format
        if (!validateEmail(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        // Check if email exists
        if (await User.findOne({ email })) {
            return res.status(409).json({ message: "Email already exists" });
        }
        // Check if phone exists
        if (await User.findOne({ name })) {
            return res.status(409).json({ message: "name number already exists" });
        }
        if (await User.findOne({ phone })) {
            return res.status(409).json({ message: "Phone number already exists" });
        }
        if (await User.findOne({ studentId })) {
            return res.status(409).json({ message: "Matriculation number already exists" });
        }
        //checking if student id is from phibmat
        //    if (await IDS.findOne({ studentId })) {
        //     return res.status(404).json({ message: "your student id is not from phibmat" });
        // }



        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser = new User({
            name,
            email,
            studentId,
            role,
            balance,
            age,
            phone,
            password: hashedPassword,
            profile: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`
        });
        await newUser.save();
        const token = generateToken(newUser);
        res.status(201).json({
            user: newUser,
            token
        });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "Server error" });
    }
});


//login user
router.post("/login", async (req, res) => {
    try {
        // allow a single field to hold either email or phone (support multiple names for compatibility)
        const credential = (req.body.identifier || req.body.login || req.body.email || req.body.phone || "").toString().trim();
        const { password } = req.body;

        if (!credential || !password) {
            return res.status(400).json({ message: "Credential and password are required" });
        }

        let user = null;
        if (validateEmail(credential)) {
            // login by email (normalize to lowercase)
            user = await User.findOne({ email: credential.toLowerCase() });
        } else {
            // login by phone: try exact match and a digits-only normalized match
            const normalized = credential.replace(/\D/g, "");
            user = await User.findOne({
                $or: [
                    { phone: credential },
                    { phone: normalized }
                ]
            });
        }

        if (!user) {
            return res.status(401).json({ message: "Invalid email/phone or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email/phone or password" });
        }

        const token = generateToken(user);
        res.status(200).json({ user, token });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Server error" });
    }
});


//update user by id
router.put("/updateuser/:id", decodeTokenFromReq, async (req, res) => {
    try {
        const userId = req.params.id;
        const updates = req.body;
        const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Server error" });
    }
});


router.get("/decode/token/user", async (req, res) => {
    try {
        // call decode helper with the full request so it can check body, headers or cookies
        const result = decodeTokenFromReq(req);

        if (!result || !result.ok) {
            return res.status(result && result.status ? result.status : 401).json({ message: result && result.message ? result.message : "Failed to decode token" });
        }

        return res.status(200).json({ data: result.payload });
    } catch (error) {
        console.error("Token decode error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


//get all users
router.get("/allusers", async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error" });
    }
});
// fet user byid
router.get("/user/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Server error" });
    }
});
export default router;