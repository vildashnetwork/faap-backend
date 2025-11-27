import express from "express"

import RequestToBeCandidate from "../models/requesttobeCandidate.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { name, manifesto, photo, color,
            colorIndex, bg, email, approved, aboutyourteam } = req.body;
        if (
            !name ||
            !manifesto ||
            !photo ||
            !color ||
            bg === undefined || bg === null || bg === '' ||
            !email ||
            (colorIndex === undefined || colorIndex === null) ||
            (approved === undefined || approved === null) ||
            !Array.isArray(aboutyourteam) || aboutyourteam.length === 0
        ) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (await RequestToBeCandidate.findOne({ email })) {
            return res.status(409).json({ message: "THIS REQUEST HAD ALREADY BEEN PLACED" });
        }

        const newrequest = new RequestToBeCandidate({
            name, manifesto, photo, color,
            colorIndex, bg, email, approved, aboutyourteam
        });
        const saverequest = await newrequest.save()
        if (saverequest) {
            res.status(200).json({ request: saverequest, message: "REQUEST PLACED SUCESSFULLY" })
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server error" })
    }

})


router.get("/", async (req, res) => {
    try {
        const request = await RequestToBeCandidate.find({});
        res.status(200).json({ request });
    }
    catch (error) {
        console.error("Fetch all admins error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


export default router