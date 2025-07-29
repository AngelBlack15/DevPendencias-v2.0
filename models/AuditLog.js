//models/AuditLogs.js
import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['create', 'update', 'delete'],
    required: true
  },
  postId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Link', required: true },
  postTitle:   { type: String, required: true },
  adminId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Administrator', required: true },
  adminName:   { type: String, required: true },
  changes:     { type: Object, default: {} },    // { field: { before, after }, ... }
  timestamp:   { type: Date, default: Date.now }
});

export default mongoose.model('AuditLog', auditLogSchema);
