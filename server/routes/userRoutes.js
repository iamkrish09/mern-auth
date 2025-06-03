const express = require('express');
const userAuth = require('../middleware/userAuth.js');
const { getUserData } = require('../controllers/userController.js');


const router = express.Router();

// Get Users Data
router.get('/data', userAuth, getUserData);

module.exports = router;
