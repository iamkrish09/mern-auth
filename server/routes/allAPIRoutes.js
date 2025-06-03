
const router = require("./authRoutes");
const userRoutes = require("./userRoutes");

// Route for authentication
router.use('/auth', router)

// Route for User
router.use('/user', userRoutes)

module.exports = router;