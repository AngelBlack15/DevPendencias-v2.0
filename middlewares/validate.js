// middlewares/validate.js
const { validationResult } = require('express-validator');

exports.checkErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Enviamos array de errores
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
