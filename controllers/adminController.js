import User from '../models/User.js';
import bcrypt from 'bcrypt';
import Order from '../models/Order.js';
import session from 'express-session';

const getUsers = async (req, res) => {
    const users = await User.find({});
    if (!users) {
        return res.status(404).json({
            message: "No Users found"
        });
    }
    res.json(users.map(user => {
        return {
            email: user.email,
            username: user.username,
            createdAt: user.createdAt
        };
    }));
};


const admin = {
    getUsers
};

export default admin;