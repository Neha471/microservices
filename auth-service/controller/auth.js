const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function register(req, res) {
    try {
        const { email, password, name } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ msg: 'User already exists' });

        const hashed = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashed, name });
        await user.save();
        res.json({ msg: 'User registered', userId: user._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({ token, userId: user._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function me(req, res) {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });
    
        const { password,name, ...userWithoutPassword  } = user.toObject();
        return res.status(200).json({ ...userWithoutPassword, firstName: name.split(' ')[0], lastName: name.split(' ')[1] });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

async function update(req, res) {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        user.name = req.body?.name || user.name;
        user.email = req.body?.email || user.email;
        user.password = req.body?.password || user.password;
        user.designation = req.body?.designation || user.designation;
        user.mobileNumber = req.body?.mobileNumber || user.mobileNumber;
        user.address = req.body?.address || user.address;
        user.about = req.body?.about || user.about;
        user.updatedAt = new Date();
        await user.save();
        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

module.exports={
    register,
    login,
    me,
    update
}