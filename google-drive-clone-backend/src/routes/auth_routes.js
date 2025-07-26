// src/routes/auth_routes.js (example)
const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth_controller");
const { verifyToken } = require("../middlewares/auth"); // Your authentication middleware

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

// NEW: Endpoint to check session/get current user
router.get("/me", verifyToken, authController.getMe); // `auth` middleware will verify the cookie/token
// and set req.user if successful



// ... (existing register, login, logout methods) ...

module.exports = router;
