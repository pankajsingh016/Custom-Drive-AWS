const authService = require('../services/auth_services');
const { successResponse, errorResponse } = require('../utils/response');

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.register(email, password);
    successResponse(res, { id: user.id, email: user.email }, 'Registered successfully');
  } catch (err) {
    errorResponse(res, err.message);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);
    res.cookie("token",token,{
      httpOnly:true,
      secure:false,
      sameSite:"Lax",
      maxAge:7*24*60*60*1000,
    });
    successResponse(res, { user, token }, 'Login successful');
  } catch (err) {
    errorResponse(res, err.message);
  }
};

exports.logout = async (req, res) => {

  try {
    res.clearCookie("token",{ // Replace 'token' with your actual cookie name
        httpOnly: true,
        secure: false,
        sameSite: 'Lax', // Or 'Strict', depending on your needs
        path: '/', // The path must match the path the cookie was set with
    });

    // 3. Send a success response
    successResponse(res, null, "Logged out successfully.");

  } catch (error) {
    console.error("Logout error:", error);
    errorResponse(res, "An error occurred during logout.", 500);
  }
};

exports.getMe = (req, res) => {
  // If the 'auth' middleware successfully verified the user, req.user will be populated
  if (req.user) {
    successResponse(res, { user: req.user }, "User session active.");
  } else {
    // This case should ideally not be hit if auth middleware always redirects/errors on failure
    errorResponse(res, "No active session.", 401);
  }
};