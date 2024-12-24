import User from '../models/user.js';
import bcrypt from 'bcrypt';
import session from 'express-session';
import Measurement from '../models/measurements.js';
import { garmentPrice, fabricPrice } from '../utils/price.js';
import Order from '../models/order.js';

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
            const user = {firstName, lastName, email, password, createdAt, username};
            newUser = await User.create(user);
        }
        return res.json({ message: `${newUser.username} registered successfully` });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: "An error occurred"
        });
    }
};

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
            username: user.username
        };
    }));
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
        req.session.username = user.username;
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
        const username = `${firstName}_${lastName}`;
        const user = {firstName, lastName, email, password: hashedPassword, username};
        const updatedUser = await User.findOneAndUpdate({_id: req.session.userId}, user, {new: true});
        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }
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
        const order = {username, garment, quantity, price, cost, fabric, colour, orderDate, deliveryDate, deliveryAddress, status};
        const newOrder = await Order.create(order);
        if (!newOrder) {
            return res.status(404).json({
                message: "Order not created"
            });
        }
        res.json({
            message: `Order created successfully, your order ID is ${newOrder._id}...proceed to payment`
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
    try {

        const deletedOrder = await Order.findOne({}).deleteOne();
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


const users = {
    signUp,
    getUsers,
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
    removeOrder
};
export default users;