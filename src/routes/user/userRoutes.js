const express = require('express');
const UserController = require('../../conrtollers/userController')
const authenticateToken = require('../../middleware/auth');

const router = express.Router();

router.post('/', authenticateToken, UserController.CreateUser);
router.get('/', authenticateToken, UserController.getAllUser);
router.post('/login', UserController.login);
module.exports = router;