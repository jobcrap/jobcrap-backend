const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const connectDB = require('./config/database');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimitMiddleware');

// Initialize App
const app = express();

// Connect to Database
connectDB();

// Middleware
// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
})); // Security headers

const allowedOrigins = [
    config.frontendUrl,
    'https://www.jobcrap.com',
    'https://jobcrap.com'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1')) {
            callback(null, true);
        } else {
            console.log('Origin not allowed by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.get('/', (req, res) => {
    try {
        res.status(200).json({
            message: 'Server is running successfully',
            error: false,
        })
    } catch (err) {
        res.status(200).json({
            message: err,
            error: true,
        })
    }
})
app.use(express.json()); // Body parser
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logging

// Apply Rate Limiting
app.use('/api', apiLimiter);

// Routes
app.use('/api', routes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Start Server
const server = app.listen(config.port, () => {
    console.log(`🚀 Server running in ${config.nodeEnv} mode on port ${config.port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});

module.exports = app;
