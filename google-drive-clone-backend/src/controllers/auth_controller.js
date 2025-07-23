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
    const { token } = await authService.login(email, password);
    successResponse(res, { token }, 'Login successful');
  } catch (err) {
    errorResponse(res, err.message);
  }
};
