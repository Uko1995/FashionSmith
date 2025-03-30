import User from '../models/user.js';
import bcrypt from 'bcrypt';
import Order from '../models/order.js';
import session from 'express-session';

const getUsers = async (req, res) => {
    try {
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
                createdAt: user.createdAt,
                role: user.role
            };
        }));
    } catch (error) {
        console.error( 'Error: ', error.message, error.stack);
        res.status(500).json({
            message: "Operation failed",
            error: error.message
        });
    }
};
    
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('userId', 'username email');
        if (orders.length === 0) {
            return res.status(404).json({
                message: "No Orders found"
            });
        }
        res.json(orders.map(order => {
            return {
                garment: order.garment,
                orderId: order._id,
                createdAt: order.orderDate,
                deliveryDate: order.deliveryDate,
                user: order.userId.username,
                email: order.userId.email,
                userId: order.userId._id
            };
        }));
    } catch (error) {
        console.error( 'Error: ', error.message, error.stack);
        res.status(500).json({
            message: "Operation failed",
            error: error.message
        });
    }
};

const isAdmin = (req, res, next) => {
    if (req.session.role === 'admin') {
        next();
    } else {
        console.error( 'Error: ', error.message, error.stack);
        res.status(403).json({
            message: "ADMIN ACCESS ONLY"
        });
    }
};


const admin = {
    getUsers,
    getOrders,
    isAdmin
};

export default admin;