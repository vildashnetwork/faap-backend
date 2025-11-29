import express from 'express';
import Election from '../models/Election.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { title, candidates, startAt, endAt, status, eligibility } = req.body;

        const election = new Election({
            title,
            candidates,
            startAt,
            endAt,
            status,
            eligibility,
        });

        const savedElection = await election.save();
        res.status(201).json(savedElection);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

//edit election
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title,
            candidates,
            startAt,
            endAt,
            status,
            eligibility, } = req.body;
        const updatedElection = await Election.findByIdAndUpdate(
            id,
            {
                title,
                candidates,
                startAt,
                endAt,
                status,
                eligibility,
            },
            { new: true }
        );
        res.status(200).json(updatedElection);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

//delete election
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Election.findByIdAndDelete(id);
        res.status(200).json({ message: 'Election deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


router.get("/", async (req, res) => {
    try {
        const elect = await Election.find();
        if (elect) {
            res.status(200).json({ elect })

        } else {
            res.status(400).json({ message: "no data fetched" })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "internal server error" })
    }
})

export default router;