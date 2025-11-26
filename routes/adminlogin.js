import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import decodeTokenFromReq from "./decode.js";
import Admin from "../models/Admin.js";

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



router.post("/register", async (req, res) => {
    try {
        // extract fields and normalize interest to an array of strings
        let { username, email, password, profile } = req.body;



        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate email format
        if (!validateEmail(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }



        // Check if email exists
        if (await Admin.findOne({ email })) {
            return res.status(409).json({ message: "Email already exists" });
        }

        // Check if phone exists
        if (await Admin.findOne({ username })) {
            return res.status(409).json({ message: "name number already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser = new Admin({
            username,
            email,
            password: hashedPassword,
            profile: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`

        });



        const savedUser = await newUser.save();

        const token = generateToken(savedUser);

        res.status(201).json({
            message: "Registration successful",
            token
        });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});



router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = await Admin.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const token = generateToken(user);
        res.status(200).json({
            message: "Login successful",
            token
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.get("/decode/token/admin", async (req, res) => {
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



router.delete("/delete", async (req, res) => {
    try {

        await Admin.deleteMany({});
        res.status(200).json({ message: "All admins deleted successfully" });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/allowners", async (req, res) => {
    try {
        const owners = await Admin.find({});
        res.status(200).json({ owners });
    }
    catch (error) {
        console.error("Fetch all admins error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


//delete admin byid

router.delete("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const deletedAdmin = await Admin.findByIdAndDelete(id);
        if (!deletedAdmin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.status(200).json({ message: "Admin deleted successfully" });
    } catch (error) {
        console.error("Delete admin error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


//update admin by id

router.put("/update/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, password, profile } = req.body;
        const updatedData = { username, email, profile };

        if (password) {
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
            updatedData.password = hashedPassword;
        }
        const updatedAdmin = await Admin.findByIdAndUpdate(id, updatedData, { new: true });
        if (!updatedAdmin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.status(200).json({ message: "Admin updated successfully", updatedAdmin });
    } catch (error) {
        console.error("Update admin error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
//update admins profile only by id

router.put("/updateprofile/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { profile } = req.body;
        const updatedAdmin = await Admin.findByIdAndUpdate(id, { profile }, { new: true });
        if (!updatedAdmin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.status(200).json({ message: "Admin profile updated successfully", updatedAdmin });
    } catch (error) {
        console.error("Update admin profile error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


//get admin by id
router.get("/admin/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await Admin.findById(id);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.status(200).json(admin);
    } catch (error) {
        console.error("Error fetching admin:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});




export default router;