require("dotenv").config();

const express = require("express");
const connectDB = require("./config/mongodb.js");
const allAPIRoutes = require("./routes/allAPIRoutes.js");

const setupMiddleware = require("./middleware/middlewareSetup.js");
const setupProcessHandlers = require("./logs/processHandlers.js");
const logger = require("./logs/logger.js");

const app = express();

// Connect to DB
connectDB().then(() => {
    logger.info('Database connected successfully');
}).catch((err) => {
    logger.error('Database connection failed:', err);
});

// Setup all middleware
const errorHandler = setupMiddleware(app);

//  Routes
app.get("/", (req, res) => {
    res.send("API working");
});

app.use("/api/v1", allAPIRoutes);

// Error handling middleware
app.use(errorHandler);

// Setup process handlers for uncaught exceptions and rejections
setupProcessHandlers();

//  Start Server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
});

