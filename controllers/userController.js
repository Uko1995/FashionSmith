import dotenv from 'dotenv';
dotenv.config();
import User from '../models/user.js';
import UserVerification from '../models/userVerification.js';
import bcrypt from 'bcrypt';
import session from 'express-session';
import Measurement from '../models/measurements.js';
import { garmentPrice, fabricPrice } from '../utils/price.js';
import Order from '../models/order.js';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';

const signUp = async (req, res) => {
    let {firstName, lastName, email, password} = req.body;
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).send({
            message: "All fields are required"
        });
    }
    
    if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    if (!/[0-9]/.test(password)) {
        return res.status(400).json({ message: "Password must contain a number" });
    } else if (!/[A-Z]/.test(password)) {
        return res.status(400).json({ message: "Password must contain an uppercase letter" });
    } else if (!/[a-z]/.test(password)) {
        return res.status(400).json({ message: "Password must contain a lowercase letter" });
    } else if (!/[!@#$%^&*]/.test(password)) {
        return res.status(400).json({ message: "Password must contain a special character" });
    } else {
        console.log('Password is valid');
    }

    let newUser;
    
    try {
        const existingUser = await User.findOne({email: req.body.email});
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            password = hashedPassword;
            const createdAt = new Date().toUTCString();
            const username = `${firstName}_${lastName}`;
            const role = "user";
            const user = {firstName, lastName, email, password, createdAt, username, role};
            newUser = await User.create(user);
            newUser.save();
        }
        return res.json({ message: `${newUser.username} registered successfully` });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: "An error occurred"
        });
    }
};

const deleteUsers = async (req, res) => {
    const users = await User.deleteMany({});
    if (!users) {
        return res.status(404).json({
            message: "No Users found"
        });
    }
    res.send('All users deleted successfully')
};

const getUser = async (req, res) => {
    try {
        const user = await User.findOne({email: req.session.email});
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.json(user);
    } catch (error) {
        console.error('Error:', error.message, error.stack);
        return res.status(500).json({
            message: "An error occurred"
        });
    }
};

const login = async (req, res) => {
    const {email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }
    try {
        const user = await User.findOne({email: email});
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({
                message: "incorrect password"
            });
        }
        //store user in session
        req.session.userId = user._id;
        req.session.email = user.email;
        req.session.username = user.username;
        req.session.role = user.role;
        return res.json({
            message: `Welcome ${req.session.username}`
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred"
        });
    }
};

const isAuthenticated = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({
            message: "Please login"
        });
    }
    next();
};

const logout = (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({
                message: "An error occurred"
            });
        }
        res.json({
            message: "Logged out successfully"
        });
    });
};

const removeUser = async (req, res) => {
    try {

        const deletedUser = await User.findOneAndDelete({_id: req.session.userId});
        if (!deletedUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.json({
            message: `${req.session.username} deleted successfully`
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred"
        });
    }
};

const updateUserInfo = async (req, res) => {
    const {firstName, lastName, email, password} = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = {};
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email;
        if (password) user.password = hashedPassword;

        const updatedUser = await User.findOneAndUpdate({_id: req.session.userId}, user, {new: true, runValidators: true});
        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        const username = `${updatedUser.firstName}_${updatedUser.lastName}`;
        req.session.username = username;
        await updatedUser.save();
        res.json({
            message: `${updatedUser.username} updated successfully`
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred"
        });
    }
};

const addMeasurement = async (req, res) => {
    const {Neck, Shoulder, Chest, NaturalWaist, Hip, KaftanLength, SuitLength, LongSleeve, ShortSleeve, MidSleeve, ShortSleeveWidth, TrouserLength, ThighWidth, KneeWidth, AnkleWidth} = req.body;
    try {
        const measurement = {Neck, Shoulder, Chest, NaturalWaist, Hip, KaftanLength, SuitLength, LongSleeve, ShortSleeve, MidSleeve, ShortSleeveWidth, TrouserLength, ThighWidth, KneeWidth, AnkleWidth};
        const newMeasurement = await Measurement.create(measurement);
        newMeasurement.save();
        if (!newMeasurement) {
            return res.status(404).json({
                message: "Measurements not added"
            });
        }
        res.json({
            message: `Measurement added successfully`
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred"
        });
    }
}

const displayMeasurement = async (req, res) => {
    const measurements = await Measurement.find({}, {__v: 0, _id: 0});
    if (!measurements) {
        return res.status(404).json({
            message: "No measurements found"
        });
    }
    res.json(measurements);
};

const updateMeasurement = async (req, res) => {
    const {Neck, Shoulder, Chest, NaturalWaist, Hip, KaftanLength, SuitLength, LongSleeve, ShortSleeve, MidSleeve, ShortSleeveWidth, TrouserLength, ThighWidth, KneeWidth, AnkleWidth} = req.body;
    try {
        const measurement = {Neck, Shoulder, Chest, NaturalWaist, Hip, KaftanLength, SuitLength, LongSleeve, ShortSleeve, MidSleeve, ShortSleeveWidth, TrouserLength, ThighWidth, KneeWidth, AnkleWidth};
        const updatedMeasurement = await Measurement.findOneAndUpdate({}, measurement, {new: true});
        if (!updatedMeasurement) {
            return res.status(404).json({
                message: "Measurement not found"
            });
        }
        res.json({
            message: `Measurement updated successfully`
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred"
        });
    }
};

const removeMeasurement = async (req, res) => {
    try {

        const deletedMeasurement = await Measurement.findOneAndDelete({});
        if (!deletedMeasurement) {
            return res.status(404).json({
                message: "Measurement not found"
            });
        }
        res.json({
            message: `Measurement deleted successfully`
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred"
        });
    }
};

const createOrder = async (req, res) => {
    let { garment, quantity, fabric, colour, deliveryDate, deliveryAddress } = req.body;
    if (!garment || !quantity || !fabric || !colour || !deliveryDate || !deliveryAddress) {
        return res.status(400).json({ message: "All fields are required" });
    }
    console.log(req.body);

    garment = garment.charAt(0).toUpperCase() + garment.slice(1).toLowerCase();
    try {
        let price;
        let status = 'Pending';
        const orderDate = new Date().toISOString();
        const deliveryDateObj = new Date(deliveryDate);
        if (isNaN(deliveryDateObj.getTime())) {
            return res.status(400).json({ 
                message: "Invalid delivery date" 
            });
        }
        
        const username = req.session.username;
        if (!req.session.username) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }
        if (fabric === 'Ankara' || garment === 'Waistcoat') {
            price = garmentPrice[garment] + fabricPrice[fabric];
        } else if (garment === 'Trouser' || garment === 'Shirt') {
            price = garmentPrice[garment] + (fabricPrice[fabric] * 2);
        } else if (garment === 'Agbada') {
            price = garmentPrice[garment] + (fabricPrice[fabric] * 6);
        } else {
            price = garmentPrice[garment] + (fabricPrice[fabric] * 3.5);
        }
        const cost = price * quantity;
        const userId = req.session.userId;
        const order = {username, garment, quantity, price, cost, fabric, colour, orderDate, deliveryDate, deliveryAddress, status, userId};
        const newOrder = await Order.create(order);
        newOrder.save();
        if (!newOrder) {
            return res.status(404).json({
                message: "Order not created"
            });
        }
        res.json({
            message: `Order created successfully, your order ID is ${newOrder._id} ...proceed to payment`
        });
    } catch (error) {
        console.error('Order creation error:', {
            message: error.message,
            stack: error.stack,
            body: req.body
        });
        return res.status(500).json({
            message: "Order creation failed",
            error: error.message
        });
    }
};

const updateOrder = async (req, res) => {
    const {orderId, garment, quantity, fabric, colour, deliveryDate, deliveryAddress, status} = req.body;
    if (!orderId) {
        return res.status(400).json({ message: "Order ID is required" });
    }
    try {
        let price;
        const orderDate = new Date().toISOString();
        const deliveryDateObj = new Date(deliveryDate);
        if (isNaN(deliveryDateObj.getTime())) {
            return res.status(400).json({ 
                message: "Invalid delivery date" 
            });
        }
        
        const username = req.session.username;
        if (!req.session.username) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }
        if (fabric === 'Ankara' || garment === 'Waistcoat') {
            price = garmentPrice[garment] + fabricPrice[fabric];
        } else if (garment === 'Trouser' || garment === 'Shirt') {
            price = garmentPrice[garment] + (fabricPrice[fabric] * 2);
        } else if (garment === 'Agbada') {
            price = garmentPrice[garment] + (fabricPrice[fabric] * 6);
        } else {
            price = garmentPrice[garment] + (fabricPrice[fabric] * 3.5);
        }
        const cost = price * quantity;
        const order = {username, garment, quantity, price, cost, fabric, colour, orderDate, deliveryDate, deliveryAddress, status};
        const updatedOrder = await Order.findOneAndUpdate({_id: orderId}, order, {new: true});
        if (!updatedOrder) {
            return res.status(404).json({
                message: "Order not found"
            });
        }
        res.json({
            message: `Order updated successfully`
        });
    } catch (error) {
        console.error('Order update error:', {
            message: error.message,
            stack: error.stack,
            body: req.body
        });
        return res.status(500).json({
            message: "Order update failed",
            error: error.message
        });
    }
};

const showOrder = async (req, res) => {
    const order = await Order.find({}, {__v: 0});
    if (!order) {
        return res.status(404).json({
            message: "No order found"
        });
    }
    res.json(order);
};

const removeOrder = async (req, res) => {
    const { orderId } = req.params;
    try {
        const deletedOrder = await Order.findOneAndDelete({orderId});
        if (!deletedOrder) {
            return res.status(404).json({
                message: "Order not found"
            });
        }
        res.json({
            message: `Order deleted successfully`
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred"
        });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const uniqueString = uuidv4();
    const createdAt = new Date().toISOString();
    const expiresAt = Date.now() + (1 * 60 * 60 * 1000); // 1 hour
    const resetLink = `http://localhost:5000/users/resetPassword/${uniqueString}`;

    const userVerify = await new UserVerification({ email: email, uniqueString, createdAt, expiresAt });
    userVerify.save()
        .then(() => {
            console.log('User verification saved');
            console.log(userVerify);
        })
        .catch((error) => {
            console.error('Error saving user verification', error.message, error.stack);
        });

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD  // Gmail App Password
        }
    });

    transporter.verify((error, info) => {
        if (error) {
            console.error('Error verifying email', error.message, error.stack);
        } else {
            console.log('Email service is ready', info);
        }
    })
    
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Password Reset Link',
        html: `<p>Click on this link to reset your password: <a href="${resetLink}">Click here</a></p>`
    };

    try {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email', error.message, error.stack);
                res.status(500).json({ message: 'Failed to send email' });
            } else {
                console.log('Email sent: ' + info.response);
                res.json({ message: 'Reset email sent' });
            }
        });
    } catch (error) {
        console.error('Error sending email', error.message, error.stack);
        res.status(500).json({ message: 'Failed to send email' });
    }
  };

const resetPassword = async (req, res) => {
    const { uniqueString } = req.params;
    try {
        const userVerify = await UserVerification.findOne({ uniqueString });
        if (!userVerify) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (userVerify.expiresAt < Date.now()) {
            return res.status(400).json({
                message: "Token has expired, request a new one"
            });
        }
        res.send(`<form action="/users/updatePassword" method="POST">
            <input type="hidden" name="uniqueString" value="${uniqueString}">
            <input type="password" name="newPassword" placeholder="Enter new password">
            <input type="password" name="confirmPassword" placeholder="Confirm new password">
            <button type="submit">Reset Password</button>
            </form>`);

        req.session.uniqueString = uniqueString;
    } catch (error) {
        console.error('Error resetting password', error.message, error.stack);
        res.status(500).json({
            message: "An error occurred"
        });
    }
};


const updatePassword = async (req, res) => {
    const { newPassword, confirmPassword, uniqueString } = req.body;
    const password = newPassword && confirmPassword;

    if (!password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }


    if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }
    if (!/[0-9]/.test(password)) {
        return res.status(400).json({ message: "Password must contain a number" });
    } else if (!/[A-Z]/.test(password)) {
        return res.status(400).json({ message: "Password must contain an uppercase letter" });
    } else if (!/[a-z]/.test(password)) {
        return res.status(400).json({ message: "Password must contain a lowercase letter" });
    } else if (!/[!@#$%^&*]/.test(password)) {
        return res.status(400).json({ message: "Password must contain a special character" });
    } else {
        console.log('Password is valid');
    }

    const userVerify = await UserVerification.findOne({ uniqueString: uniqueString });
    console.log(userVerify);

    try {
        const user = await User.findOne({ email: userVerify.email });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match"
            });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        await user.save()
            .then(() => {
                res.json({
                    message: "Password reset successful"
                });
            })
            .catch((error) => {
                console.error('Error saving new password', error.message, error.stack);
                res.status(500).json({
                    message: "An error occurred"
                });
            });
    } catch (error) {
        console.error('Error resetting password', error.message, error.stack);
        res.status(500).json({
            message: "An error occurred"
        });
    }
};

const users = {
    signUp,
    deleteUsers,
    login,
    logout,
    isAuthenticated,
    removeUser,
    updateUserInfo,
    addMeasurement,
    displayMeasurement,
    updateMeasurement,
    removeMeasurement,
    createOrder,
    updateOrder,
    showOrder,
    removeOrder,
    getUser,
    forgotPassword,
    resetPassword,
    updatePassword
};
export default users;