import express from "express";
import Event from "../models/Events.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const {
            tournament,
            homeTeam,
            awayTeam,
            startAt,
            status,
            odds,
            score,
            one,
            two,
            bg,
        } = req.body;


        const event = new Event({
            tournament,
            homeTeam,
            awayTeam,
            startAt,
            status,
            odds,
            score,
            one,
            two,
            bg,
        });

        await event.save();
        res.status(201).json({ message: "Event created successfully", event });
    } catch (error) {
        res.status(400).send(error);
        console.log('====================================');
        console.log(error);
        console.log('====================================');
    }
});


//updating events

router.put("/:id", async (req, res) => {
    try {
        const eventId = req.params.id;
        const {
            tournament,
            homeTeam,
            awayTeam,
            startAt,
            status,
            odds,
            score,
            one,
            two,
            bg,
        } = req.body;
        const event = await Event.findByIdAndUpdate(
            eventId,
            {
                tournament,
                homeTeam,
                awayTeam,
                startAt,
                status,
                odds,
                score,
                one,
                two,
                bg,
            },
            { new: true }
        );
        if (!event) {
            return res.status(404).send({ message: "Event not found" });
        }

        res.status(200).json({ message: "Event updated successfully", event });
    } catch (error) {
        res.status(400).send(error);
    }
});

//delete match by id
router.delete("/:id", async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await Event.findByIdAndDelete(eventId);
        if (!event) {
            return res.status(404).send({ message: "Event not found" });
        }
        res.status(200).json({ message: "Event deleted successfully", event });
    } catch (error) {
        res.status(400).send(error);
    }
});


//setting the startingTime  endTime of the event

router.patch("/set-times/:id", async (req, res) => {
    try {
        const eventId = req.params.id;
        const { startingTime, endTime, duration } = req.body;
        const event = await Event.findByIdAndUpdate(
            eventId,
            { startingTime, endTime, duration },
            { new: true }
        );

        if (!event) {
            return res.status(404).send({ message: "Event not found" });
        }

        res.status(200).json({ message: "Event times updated successfully", event });
    } catch (error) {
        res.status(400).send(error);
    }
});


//get all events
router.get("/", async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (error) {
        res.status(400).send(error);
    }
});


//get events by id

router.get("/:id", async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).send({ message: "Event not found" });
        }

        res.status(200).json(event);
    } catch (error) {
        res.status(400).send(error);
    }
});

export default router;