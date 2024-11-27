import express from 'express'
import bcrypt from 'bcryptjs'

const router = express.Router()

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    res.status(201).json({ message: 'User registered successfully!' });
});