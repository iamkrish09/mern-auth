const logger = require('../logs/logger.js');

const errorHandler = (err, req, res, next) => {
    // Log error details
    logger.error('Error occurred:', {
        error: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params,
        user: req.user ? req.user.id : 'unauthorized',
        timestamp: new Date().toISOString()
    });

    // Set status code
    const statusCode = err.statusCode || 500;
    
    // Prepare error response
    const errorResponse = {
        success: false,
        message: process.env.NODE_ENV === 'production' && statusCode === 500
            ? 'Internal Server Error'
            : err.message
    };

    // Add stack trace in development
    if (process.env.NODE_ENV !== 'production') {
        errorResponse.stack = err.stack;
    }

    res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;