const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const requestLogger = require('../middleware/requestLogger');
const errorHandler = require('../middleware/errorHandler');

const setupMiddleware = (app) => {
    // Request logging middleware 
    app.use(requestLogger);

    // Standard middleware
    app.use(cors({
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true
    }));
    app.use(express.json());
    app.use(cookieParser());

    // Return error handler to be used after routes
    return errorHandler;
};

module.exports = setupMiddleware;