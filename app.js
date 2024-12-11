import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import session from 'express-session';

//database connection
mongoose.connect('mongodb://localhost:27017/fashionSmith')
.then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.log('Error:', error);
});

const app = express();
dotenv.config();

//middlewares
app.use(express.json({ limit: '30mb', extended: true }));
app.use(cors());
app.use(session({
    secret: process.env.secret_key,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 1000 * 60 * 60 * 2
    }
}))


//routes
app.use('/users', userRoutes);

app.get('/', (req, res) => {
    res.send('Hello to FashionSmith API');
});


export default app;