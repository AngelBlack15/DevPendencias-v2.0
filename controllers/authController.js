// ======================= controllers/authController.js =======================
const jwt = require('jsonwebtoken');
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Validación básica omitida para brevedad
    const user = await require('../models/User').findOne({ email });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });
    const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true }).json({ name: user.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};