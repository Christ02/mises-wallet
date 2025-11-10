# Mises Wallet - Backend

Backend API para Mises Wallet construido con Node.js y Express.

## Estructura del Proyecto

```
backend/
├── src/
│   ├── admin/          # Funcionalidades de administración
│   ├── auth/           # Autenticación y autorización
│   ├── config/         # Configuración de la aplicación
│   ├── controllers/    # Controladores de rutas
│   ├── events/         # Manejo de eventos
│   ├── faucet/         # Funcionalidad de faucet
│   ├── middleware/     # Middlewares personalizados
│   ├── notifications/  # Sistema de notificaciones
│   ├── qr/             # Generación de códigos QR
│   ├── repositories/   # Acceso a datos
│   ├── services/       # Lógica de negocio
│   ├── tokens/         # Manejo de tokens
│   ├── transactions/   # Gestión de transacciones
│   ├── users/          # Gestión de usuarios
│   ├── utils/          # Utilidades
│   ├── validators/     # Validadores de datos
│   ├── wallets/        # Gestión de wallets
│   └── index.js        # Punto de entrada
├── tests/              # Tests
├── logs/               # Logs de la aplicación
└── package.json        # Dependencias
```

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

El servidor se ejecutará en `http://localhost:3001` (configurable en `.env`)

## Producción

```bash
npm start
```

## Variables de Entorno

Crea un archivo `.env` en la raíz del backend con:

```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/mises_wallet
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5174
# RPC de Sepolia (Infura u otro proveedor)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Wallet Central (Banco Central)
CENTRAL_WALLET_ADDRESS=0x7226Cb2FA144bfe0301a6b43196E721b59FaB7f1
CENTRAL_WALLET_PRIVATE_KEY=61684035ee18f109f136b4f480b9563a45983ace85f50fc37dbb992c8ea21041
CENTRAL_WALLET_TOKEN_ADDRESS=0x72dD0e8c853dbD72BD53d29167857dC035aDF36f
CENTRAL_TOKEN_SYMBOL=HC
CENTRAL_TOKEN_DECIMALS=18
```

## Scripts Disponibles

- `npm start` - Inicia el servidor en modo producción
- `npm run dev` - Inicia el servidor en modo desarrollo con watch

