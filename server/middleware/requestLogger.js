const logger = require('../logs/logger.js');

const requestLogger = (req, res, next) => {
    // Store request start time
    req._startTime = Date.now();

    // Log request
    logger.info('Incoming Request:', {
        method: req.method,
        url: req.url,
        query: req.query,
        params: req.params,
        body: req.body,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });

    // Override end method to log response
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        // Calculate response time
        const responseTime = Date.now() - req._startTime;

        // Log response
        logger.info('Outgoing Response:', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`
        });

        // Call original end method
        originalEnd.call(this, chunk, encoding);
    };

    next();
};

module.exports = requestLogger;