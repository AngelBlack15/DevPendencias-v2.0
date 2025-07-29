// routes/links.js
import { Router }                 from 'express';
import { body, validationResult } from 'express-validator';
import mongoose                   from 'mongoose';
import Link                       from '../models/Link.js';
import AuditLog                   from '../models/AuditLog.js';

const router = Router();

// Función auxiliar para crear un log
async function logAction(action, doc, changes = {}) {
  try {
    await AuditLog.create({
      action,
      postId:    doc._id,
      postTitle: doc.title,
      adminId:   new mongoose.Types.ObjectId(), // Usar 'new' para crear ObjectId
      adminName: 'sistema',
      changes
    });
  } catch (error) {
    console.error('Error en logAction:', error);
    // No lanzamos el error para no interrumpir el flujo principal
  }
}

// Crear enlace (visits y likes inician en 0)
router.post(
  '/',
  body('title').notEmpty(),
  body('url').isURL(),
  body('tags').isArray({ min: 1 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) 
      return res.status(400).json({ errors: errors.array() });

    try {
      const doc = await Link.create({ ...req.body, visits: 0, likes: 0 });
      await logAction('create', doc);
      res.status(201).json(doc);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// Listar todos los enlaces
router.get('/', async (req, res) => {
  try {
    const all = await Link.find().sort('-createdAt');
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar enlace (incluye likes y visits)
router.put(
  '/:id',
  body('title').optional().notEmpty(),
  body('url').optional().isURL(),
  body('tags').optional().isArray(),
  body('likes').optional().isInt({ min: 0 }),
  body('visits').optional().isInt({ min: 0 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) 
      return res.status(400).json({ errors: errors.array() });

    try {
      // Cargar el estado anterior
      const before = await Link.findById(req.params.id).lean();
      if (!before) 
        return res.status(404).json({ error: 'No encontrado' });

      // Actualizar
      const updated = await Link.findByIdAndUpdate(req.params.id, req.body, { new: true });
      
      // Determinar cambios
      const changes = {};
      for (const key of Object.keys(req.body)) {
        changes[key] = { before: before[key], after: updated[key] };
      }

      await logAction('update', updated, changes);
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// Eliminar enlace
router.delete('/:id', async (req, res) => {
  try {
    const doc = await Link.findById(req.params.id);
    if (!doc) 
      return res.status(404).json({ error: 'No encontrado' });

    await Link.findByIdAndDelete(req.params.id);
    await logAction('delete', doc);
    res.sendStatus(204);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Registrar una visita a un enlace
router.post('/:id/visit', async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ error: 'Enlace no encontrado' });
    }
    
    // Incrementar el contador de visitas
    link.visits = (link.visits || 0) + 1;
    await link.save();
    
    // Devolver el enlace actualizado
    res.json(link);
  } catch (err) {
    console.error('Error al registrar visita:', err);
    res.status(500).json({ error: 'Error al registrar la visita' });
  }
});

export default router;
