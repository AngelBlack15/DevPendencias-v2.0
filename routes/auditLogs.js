//routes/auditLogs.js
import { Router } from 'express';
import AuditLog   from '../models/AuditLog.js';

const router = Router();

// GET /api/audit-logs — Listar todos los logs
router.get('/', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort('-timestamp').lean();
    res.json(logs);
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    res.status(500).json({ error: 'Error fetching audit logs' });
  }
});

// POST /api/audit-logs — Crear un log
router.post('/', async (req, res) => {
  try {
    const { action, postId, postTitle, adminId, adminName, changes } = req.body;
    const log = await AuditLog.create({ action, postId, postTitle, adminId, adminName, changes });
    res.status(201).json(log);
  } catch (err) {
    console.error('Error creating audit log:', err);
    res.status(400).json({ error: err.message });
  }
});

export default router;
