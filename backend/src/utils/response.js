exports.successResponse = (res, data, message = 'Success') => {
  res.status(200).json({ success: true, message, data });
};

exports.errorResponse = (res, message = 'Error', code = 500) => {
  res.status(code).json({ success: false, message });
};
