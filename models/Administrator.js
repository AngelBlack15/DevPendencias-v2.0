import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }
}, {
  timestamps: true
});

// Evitar OverwriteModelError si el modelo ya existe
const Administrator = mongoose.models.Administrator || mongoose.model('Administrator', adminSchema);

export default Administrator;
