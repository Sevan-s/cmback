const express = require("express")

const router = express.Router();
const opinionController = require('../../conrtollers/opinionController')

router.post('/', opinionController.CreateOpinion);
router.get('/', opinionController.getOpinion);
router.delete('/:id', opinionController.delOpinion)
module.exports = router