// models/Link.js
import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  url:         { type: String, required: true },
  image:       { type: String },
  tags:        { type: [String], default: [] },
  visits:      { type: Number, default: 0 },  // ← nuevo
  likes:       { type: Number, default: 0 }   // ← nuevo
}, { timestamps: true });

export default mongoose.model('Link', linkSchema);
