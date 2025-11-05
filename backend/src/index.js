import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from './config/config.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de ejemplo
app.get('/', (req, res) => {
  res.json({ 
    message: 'Mises Wallet API',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Importar rutas (se crearán después)
// import authRoutes from './auth/routes.js';
// import userRoutes from './users/routes.js';
// import walletRoutes from './wallets/routes.js';
// etc.

// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/wallets', walletRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

