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
```

## Scripts Disponibles

- `npm start` - Inicia el servidor en modo producción
- `npm run dev` - Inicia el servidor en modo desarrollo con watch

