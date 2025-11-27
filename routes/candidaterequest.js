import express from "express"

import RequestToBeCandidate from "../models/requesttobeCandidate.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { name, manifesto, photo, color,
            colorIndex, bg, email, approved, aboutyourteam } = req.body;




        // BEFORE
        // if (!name || !manifesto || !photo || !color || !colorIndex || !bg || !email || !approved || aboutyourteam.length == 0) {
        //   return res.status(400).json({ message: "All fields are required" });
        // }

        // AFTER — safer presence checks
        const missingFields = [];

        // top-level required (presence)
        if (name === undefined || name === null || String(name).trim() === '') missingFields.push('name');
        if (manifesto === undefined || manifesto === null || String(manifesto).trim() === '') missingFields.push('manifesto');
        if (photo === undefined || photo === null || String(photo).trim() === '') missingFields.push('photo');
        if (color === undefined || color === null || String(color).trim() === '') missingFields.push('color');
        if (colorIndex === undefined || colorIndex === null || Number.isNaN(Number(colorIndex))) missingFields.push('colorIndex');
        if (bg === undefined || bg === null || String(bg).trim() === '') missingFields.push('bg');
        if (email === undefined || email === null || String(email).trim() === '') missingFields.push('email');
        // approved is boolean: only check for undefined/null (allow false)
        if (approved === undefined || approved === null) missingFields.push('approved');

        // aboutyourteam must be an array with at least one member
        if (!Array.isArray(aboutyourteam) || aboutyourteam.length === 0) missingFields.push('aboutyourteam');

        if (missingFields.length > 0) {
            return res.status(400).json({ message: `Missing or invalid fields: ${missingFields.join(', ')}` });
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