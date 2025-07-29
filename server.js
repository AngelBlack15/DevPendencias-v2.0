// server.js
import 'dotenv/config';
import express      from 'express';
import mongoose     from 'mongoose';
import cors         from 'cors';
import cookieParser from 'cookie-parser';
import multer      from 'multer';
import path         from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Configuración de rutas de archivo para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    // Crear el directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar un nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'img-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Límite de 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG, GIF, WebP)'));
    }
  }
});

// Importa solo una vez auditLogsRoutes
import auditLogsRoutes  from './routes/auditLogs.js';

import authRoutes           from './routes/auth.js';
import administratorsRoutes from './routes/administrators.js';
import linksRoutes          from './routes/links.js';
import usersRoutes          from './routes/users.js';

const app  = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta para subir imágenes
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
    }
    
    // Construir la URL completa de la imagen
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.status(200).json({
      message: 'Imagen subida correctamente',
      url: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    res.status(500).json({ 
      error: 'Error al subir la imagen',
      details: error.message 
    });
  }
});

// Rutas API
app.use('/api/audit-logs',       auditLogsRoutes);
app.use('/api/administrators',   administratorsRoutes);
app.use('/api/login',            authRoutes);
app.use('/api/links',            linksRoutes);
app.use('/api/users',            usersRoutes);

// 404 para /api que no existan
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// En producción, servir la carpeta `dist` de Vite
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve('devpendencias-ui', 'dist');
  app.use(express.static(distPath));
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // En desarrollo, placeholder en /
  app.get('/', (req, res) => {
    res.send(`API Express corriendo en http://localhost:${PORT}`);
  });
}

// Conexión a MongoDB y arranque del servidor
mongoose.connect(process.env.MONGO_URI, { dbName: 'devpendencias' })
  .then(() => {
    console.log(`✅ MongoDB conectado a ${mongoose.connection.name}`);
    app.listen(PORT, () =>
      console.log(`🚀 Server corriendo en http://localhost:${PORT}`)
    );
  })
  .catch(err => {
    console.error('❌ Error al conectar MongoDB:', err.message);
    process.exit(1);
  });
