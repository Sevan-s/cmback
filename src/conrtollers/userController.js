const User = require('../models/user')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.CreateUser = async (req, res) => {
    const saltRounds = 10;

    try {
        const {email, password} = req.body;

        const existingUser = await User.findOne({email})

        if (existingUser) {
            return res.status(400).json({message: 'this email adress is already used'})
        }
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({email, password: hashedPassword});
        await newUser.save();

        res.status(201).json({UserList: newUser})
    } catch (error) {
        res.status(500).json({error: 'error creating user', details: error});
        console.log('error ', error)
    }
}

exports.getAllUser = async (req, res) => {
    try {
        const userList = await User.find();
        res.status(200).json({UserList: userList})
    } catch (error) {
        res.status(500).json({error:'error getting all user list', details: error});
    }
}

exports.login = async (req, res) => {

    const {email, password} = req.body;
    try {
        const existingUser = await User.findOne({email})

        if (!existingUser) {
            return res.status(400).json({message: "this email adress doesn't exist"})
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
        }
        const token = jwt.sign({ id: User._id, email: User.email }, 'h9KKd1aFUK64', { expiresIn: '1h' });
        res.status(200).json({ message: "Login successful", token});
    } catch (error) {
        console.error('Logging error:', error);
        res.status(500).json({error: 'logging error', details: error});

    }
}