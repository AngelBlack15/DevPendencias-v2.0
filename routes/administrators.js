import { Router } from 'express';
import bcrypt      from 'bcrypt';
import Administrator from '../models/Administrator.js';

const router = Router();

// POST /api/administrators — Registro de admin
router.post('/', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Hashea la contraseña
    const hash = await bcrypt.hash(password, 10);

    // Crea el admin
    const admin = await Administrator.create({
      name,
      email: email.toLowerCase().trim(),
      password: hash
    });

    return res.status(201).json({ name: admin.name });
  } catch (err) {
    console.error('Error creando administrador:', err);
    // 409 por duplicado de email
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Correo ya registrado' });
    }
    return res.status(400).json({ error: err.message });
  }
});

export default router;
