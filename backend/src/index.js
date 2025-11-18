import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { config } from './config/config.js';

// Cargar variables de entorno
dotenv.config();

// Ejecutar migraciones y seeder en segundo plano al iniciar (no bloquea el servidor)
if (process.env.RUN_MIGRATIONS_ON_START !== 'false') {
  (async () => {
    try {
      // Importar dinámicamente el módulo de migraciones
      const migrationsModule = await import('./scripts/run-migrations.js');
      const { runMigrations } = migrationsModule;
      
      if (typeof runMigrations === 'function') {
        console.log('🔄 Ejecutando migraciones en segundo plano...');
        runMigrations()
          .then(() => {
            console.log('✅ Migraciones completadas exitosamente');
            
            // Después de las migraciones, ejecutar el seeder para crear el super admin
            if (process.env.RUN_SEEDER_ON_START !== 'false') {
              import('./scripts/run-seeder.js')
                .then(({ createSuperAdmin }) => {
                  console.log('🌱 Ejecutando seeder para crear super admin...');
                  return createSuperAdmin();
                })
                .then(() => {
                  console.log('✅ Seeder ejecutado (super admin creado o ya existe)');
                })
                .catch((error) => {
                  console.error('⚠️  Error al ejecutar seeder (no crítico):', error.message);
                });
            }
          })
          .catch((error) => {
            console.error('⚠️  Error al ejecutar migraciones (no crítico):', error.message);
            // No detener el servidor si las migraciones fallan
          });
      } else {
        console.error('⚠️  runMigrations no es una función, tipo:', typeof runMigrations);
      }
    } catch (error) {
      console.error('⚠️  No se pudo cargar el script de migraciones:', error.message);
      // Continuar iniciando el servidor
    }
  })();
}

const app = express();
// En Docker, el puerto interno es 3000 (mapeado a 3001 externo)
// Usar el puerto de la variable de entorno si existe, sino 3000
const PORT = parseInt(process.env.PORT) || 3000;

// Middlewares
const corsOptions = {
  origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

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

// Importar rutas
import authRoutes from './auth/routes.js';
import walletRoutes from './routes/walletRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

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

