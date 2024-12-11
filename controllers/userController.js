import User from '../models/user.js';
import bcrypt from 'bcrypt';
import session from 'express-session';

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

export { signUp, getUsers, deleteUsers, login, logout, isAuthenticated, removeUser, updateUserInfo };