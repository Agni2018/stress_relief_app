// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/change-password', authController.changePassword);
router.get('/session', authController.checkSession);
router.post('/set-username', authController.setUsername);
router.post('/logout', authController.logout);

module.exports = router;
