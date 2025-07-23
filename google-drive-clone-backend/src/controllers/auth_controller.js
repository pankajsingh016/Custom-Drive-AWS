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
