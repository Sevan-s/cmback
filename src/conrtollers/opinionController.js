const Opinion = require('../models/opinion');

exports.CreateOpinion = async (req, res) => {
    try {
        const { text } = req.body
        const newOpinion = new Opinion({ text })
        await newOpinion.save();
        res.status(201).json({ Opinion: newOpinion })
    } catch (error) {
        console.log('error :', error)
        res.status(500).json({ error: 'Error creating opinion', details: error })
    }
}

exports.getOpinion = async (req, res) => {
    try {
        const opinion = await Opinion.find()
        res.status(200).json({Opinion: opinion})
    } catch (error) {
        console.log('error :', error)
        res.status(500).json({ error: 'Error getting opinion', details: error })
    }
}

exports.delOpinion = async (req, res) => {
    try {
        const opinion = await Opinion.findByIdAndDelete({_id: req.params.id})
    if (result.deletedCount === 0) {
            return res.status(404).json({error: "Opinion not Found"});
        }
        res.status(204).json({opinion})
    } catch (error) {
        res.status(500).json({error: "Error deleting opinion"})
    }
}