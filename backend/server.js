
require('dotenv').config();
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const aiRoutes = require('./routes/aiRoutes');
const userRoutes = require('./routes/userRoutes');


connectDB();

const app = express();


const allowedOrigins = [
    'http://localhost:5000', // For local testing
    'http://localhost:3000', // If you test locally on port 3000
    // CRITICAL: Your Vercel Frontend URL
    'https://camila1-pi.vercel.app' 
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps/postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // Log the blocked origin for debugging
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'), false);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true 
}));


app.use(express.json());


app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => res.send('API Running!'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));