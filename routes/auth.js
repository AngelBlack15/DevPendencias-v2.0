// routes/auth.js
import { Router } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Admin from '../models/Administrator.js';

const router = Router();

// POST /api/login
router.post('/', async (req, res) => {
  const { username, email, password } = req.body;

  // 1) Validar payload
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: 'Usuario, email y contraseña requeridos' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // 2) Buscar en users
    let account = await User.findOne({ email: normalizedEmail });
    let role = 'user';

    // 3) Si no existe en users, buscar en administrators
    if (!account) {
      account = await Admin.findOne({ email: normalizedEmail });
      role = 'admin';
    }

    // 4) Si no existe en ninguna colección
    if (!account) {
      return res.status(401).json({ error: 'Correo no registrado' });
    }

    // 5) Comparar nombre de usuario (case‑insensitive)
    const sentName = username.trim().toLowerCase();
    const storedName = account.name.trim().toLowerCase();
    if (storedName !== sentName) {
      return res.status(401).json({ error: 'Nombre de usuario incorrecto' });
    }

    // 6) Verificar contraseña
    const match = await bcrypt.compare(password, account.password);
    if (!match) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // 7) Éxito: devolver nombre y rol
    return res.json({
      name: account.name,
      role, // 'user' o 'admin'
    });
  } catch (err) {
    console.error('Error en /api/login:', err);
    return res
      .status(500)
      .json({ error: 'Error interno del servidor' });
  }
});

export default router;
