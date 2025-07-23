const User = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try{
        const { username, password, role } = req.body;
        var user = await User.findOne({username})
        console.log(user)
        if(user){
            return res.send('User already exists!!').status(400);
        }
        user = new User({
            username,
            password,
            role
        })
        await user.save();
        res.send('User registered successfully').status(201);
    }catch(err){
        res.status(500).send('Server Error');
    }
}

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (user && user.role === "auditor") {
            if (password === user.password) {
                const { token, payload } = generateToken(user);
                res.json({ message: 'Welcome Auditor', token, payload });
            } else {
                res.status(401).send('Invalid password');
            }
        } else if (user && user.role === "cashier") {
            if (password === user.password) {
                const { token, payload } = generateToken(user);
                res.json({ message: 'Welcome Cashier', token, payload });
            } else {
                res.status(401).send('Invalid password');
            }
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        res.status(500).send('Server Error');
    }
}

function generateToken(user) {
    const payload = { user: { name: user.username, role: user.role } };
    const token = jwt.sign(payload, 'jwtsecret', { expiresIn: '8h' });
    return { token, payload };
}