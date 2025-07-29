// controllers/userController.js
import bcrypt from 'bcrypt';
import User from '../models/User.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Correo ya registrado' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hash
    });

    const { password: _, ...userData } = user.toObject();
    res.status(201).json(userData);
  } catch (err) {
    console.error('❌ Error al registrar usuario:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
