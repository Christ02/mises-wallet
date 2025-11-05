import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Servidor
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Base de datos
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/mises_wallet',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'mises_wallet',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5174',
    credentials: true,
  },
  
  // Encriptación
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'change-this-to-a-strong-random-key-in-production-32-chars',
  },
  
  // Sepolia Testnet
  sepolia: {
    rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
  },
};

