// routes/users.js
import { Router } from 'express';
import bcrypt     from 'bcrypt';
import User       from '../models/User.js';

const router = Router();

// POST /api/users — Registro
router.post('/', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase().trim(), password: hash });
    res.status(201).json({ name: user.name });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

export default router;
