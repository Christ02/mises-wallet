# Mises Wallet - Sistema de Gestión de Billeteras Digitales

## Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Requisitos Previos](#requisitos-previos)
4. [Instalación y Configuración](#instalación-y-configuración)
5. [Estructura del Proyecto](#estructura-del-proyecto)
6. [Backend - API REST](#backend---api-rest)
7. [Frontend - Interfaz de Usuario](#frontend---interfaz-de-usuario)
8. [Base de Datos](#base-de-datos)
9. [Integración Blockchain](#integración-blockchain)
10. [Sistema de Autenticación](#sistema-de-autenticación)
11. [Deployment](#deployment)
12. [API Endpoints](#api-endpoints)
13. [Variables de Entorno](#variables-de-entorno)
14. [Scripts Disponibles](#scripts-disponibles)
15. [Flujos de Trabajo](#flujos-de-trabajo)

---

## Descripción General

Mises Wallet es una aplicación web completa para la gestión de billeteras digitales con integración blockchain. El sistema permite a los usuarios gestionar fondos digitales, realizar transacciones, participar en eventos con emprendimientos (event businesses), y administrar wallets con soporte para la red Ethereum (Sepolia testnet).

### Características Principales

- **Gestión de Wallets**: Creación y administración de billeteras Ethereum encriptadas
- **Transacciones**: Envío y recepción de tokens con historial completo
- **Sistema de Eventos**: Gestión de eventos con emprendimientos asociados
- **Pagos a Comercios**: Sistema de pagos QR para comerciantes
- **Recarga y Retiro**: Solicitudes de recarga y retiro con aprobación administrativa
- **Wallet Central**: Sistema centralizado para gestión de fondos
- **Settlement Requests**: Liquidación de fondos de emprendimientos
- **Reportes y Auditoría**: Sistema completo de logs y reportes
- **Multi-rol**: Soporte para super admin, admin y usuarios regulares
- **Sistema de Email**: Múltiples proveedores (Resend, Mailtrap, SMTP)

---

## Arquitectura del Sistema

### Tecnologías Utilizadas

#### Backend
- **Runtime**: Node.js 18+ (ES Modules)
- **Framework**: Express.js 4.18
- **Base de Datos**: PostgreSQL 15
- **ORM**: pg (driver nativo de PostgreSQL)
- **Blockchain**: Ethers.js v6.15 para Ethereum
- **Autenticación**: JWT (jsonwebtoken)
- **Seguridad**: bcryptjs para hashing de contraseñas
- **Validación**: express-validator
- **Email**: Nodemailer, Resend API
- **Archivos**: Multer para uploads

#### Frontend
- **Framework**: React 18.2 con TypeScript
- **Build Tool**: Vite 5.0
- **Estilos**: Tailwind CSS 3.3
- **Routing**: React Router Dom v6
- **HTTP Client**: Axios
- **Gráficos**: Chart.js con react-chartjs-2
- **QR Codes**: qrcode.react, html5-qrcode
- **Iconos**: React Icons

#### Infraestructura
- **Containerización**: Docker y Docker Compose
- **Deployment Backend**: Railway
- **Deployment Frontend**: Vercel
- **Base de Datos Admin**: pgAdmin 4

### Arquitectura en Capas

El backend está organizado siguiendo el patrón de arquitectura en capas:

```
Controllers (HTTP Layer)
    ↓
Services (Business Logic)
    ↓
Repositories (Data Access)
    ↓
Database (PostgreSQL)
```

---

## Requisitos Previos

### Software Necesario

- **Node.js**: v18.0.0 o superior
- **npm**: v9.0.0 o superior
- **Docker**: v20.10 o superior (opcional, para desarrollo con contenedores)
- **Docker Compose**: v2.0 o superior (opcional)
- **PostgreSQL**: v15 o superior (si no se usa Docker)
- **Git**: Para control de versiones

### Conocimientos Requeridos

- JavaScript/TypeScript
- React y React Hooks
- Node.js y Express
- PostgreSQL y SQL
- Conceptos básicos de Blockchain (Ethereum)
- REST APIs
- Docker (opcional)

---

## Instalación y Configuración

### Opción 1: Instalación con Docker (Recomendado)

#### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd mises-wallet
```

#### 2. Configurar Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```bash
# Base de Datos
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=mises_wallet

# Backend
NODE_ENV=development
ENCRYPTION_KEY=your-32-character-encryption-key-here
JWT_SECRET=your-jwt-secret-key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Frontend URL
FRONTEND_URL=http://localhost:5174

# Email Provider (elegir uno: resend, mailtrap, smtp)
EMAIL_PROVIDER=resend
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# pgAdmin
PGADMIN_EMAIL=admin@mises-wallet.com
PGADMIN_PASSWORD=admin
```

#### 3. Iniciar Servicios

```bash
docker-compose up -d
```

Esto iniciará:
- PostgreSQL en puerto `5433`
- Backend en puerto `3001`
- Frontend en puerto `5174`
- pgAdmin en puerto `5051`

#### 4. Verificar Instalación

- Frontend: http://localhost:5174
- Backend API: http://localhost:3001
- pgAdmin: http://localhost:5051

### Opción 2: Instalación Local

#### 1. Instalar PostgreSQL

Instalar PostgreSQL 15 y crear la base de datos:

```bash
createdb mises_wallet
```

#### 2. Configurar Backend

```bash
cd backend
npm install

# Crear archivo .env
cp .env.example .env
# Editar .env con tus configuraciones

# Ejecutar migraciones
npm run migrate

# Crear super admin
npm run seed

# Iniciar servidor de desarrollo
npm run dev
```

El backend estará disponible en `http://localhost:3000`

#### 3. Configurar Frontend

```bash
cd frontend
npm install

# Crear archivo .env.local
echo "VITE_API_URL=http://localhost:3000" > .env.local

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:5174`

---

## Estructura del Proyecto

```
mises-wallet/
├── backend/
│   ├── database/
│   │   └── migrations/          # Archivos SQL de migración
│   ├── src/
│   │   ├── auth/               # Rutas de autenticación
│   │   ├── config/             # Configuración de aplicación y DB
│   │   ├── controllers/        # Controladores HTTP (12 archivos)
│   │   ├── middleware/         # Middleware de autenticación y uploads
│   │   ├── repositories/       # Capa de acceso a datos (13 archivos)
│   │   ├── routes/            # Definición de rutas API
│   │   ├── scripts/           # Scripts de migración y seeding
│   │   ├── services/          # Lógica de negocio (23 servicios)
│   │   ├── utils/             # Utilidades compartidas
│   │   └── validators/        # Validadores de entrada
│   ├── uploads/               # Archivos subidos (imágenes de eventos)
│   ├── package.json
│   ├── nodemon.json
│   └── railway.json           # Configuración para Railway
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/        # Componentes compartidos (5 archivos)
│   │   ├── contexts/          # Context API de React
│   │   ├── hooks/             # Custom hooks (3 hooks)
│   │   ├── modules/
│   │   │   ├── admin/         # Módulo de administración
│   │   │   │   ├── components/
│   │   │   │   ├── pages/     # 12 páginas de admin
│   │   │   │   └── services/  # Servicios API de admin
│   │   │   └── user/          # Módulo de usuario
│   │   │       ├── components/
│   │   │       ├── pages/     # 14 páginas de usuario
│   │   │       └── services/  # Servicios API de usuario
│   │   ├── pages/             # Páginas principales
│   │   ├── services/          # Configuración API
│   │   ├── styles/            # Estilos globales
│   │   └── utils/             # Utilidades
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── vercel.json            # Configuración para Vercel
│
├── database/
│   ├── migrations/            # Migraciones compartidas
│   ├── schemas/               # Esquemas de base de datos
│   ├── scripts/               # Scripts de migración
│   └── seeders/               # Datos iniciales
│
├── docker/
│   ├── backend/
│   │   └── Dockerfile
│   ├── frontend/
│   │   ├── Dockerfile
│   │   └── nginx.conf
│   └── postgres/
│       └── init.sql
│
├── config/
│   ├── env-templates/         # Plantillas de variables de entorno
│   └── nginx/                 # Configuración de Nginx
│
├── scripts/                   # Scripts de utilidad
├── docker-compose.yml
└── README.md
```

---

## Backend - API REST

### Arquitectura del Backend

El backend sigue el patrón MVC (Model-View-Controller) con una capa adicional de servicios y repositorios.

### Controladores (Controllers)

Los controladores manejan las peticiones HTTP y las respuestas:

1. **authController.js**: Registro, login, recuperación de contraseña
2. **walletController.js**: Operaciones de wallet (balance, envío, historial)
3. **adminUserController.js**: Gestión de usuarios (CRUD)
4. **adminEventController.js**: Gestión de eventos y emprendimientos
5. **adminTransactionController.js**: Listado y verificación de transacciones
6. **adminAuditController.js**: Logs de auditoría
7. **adminReportController.js**: Generación de reportes
8. **centralWalletController.js**: Gestión de wallet central
9. **settingsController.js**: Configuración del sistema
10. **userEventController.js**: Vista de eventos para usuarios
11. **userProfileController.js**: Perfil de usuario
12. **userNotificationController.js**: Notificaciones

### Servicios (Services)

La lógica de negocio está organizada en 23 servicios especializados:

**Autenticación y Seguridad**
- `authService.js`: Lógica de autenticación
- `encryptionService.js`: Encriptación de wallets

**Wallets**
- `walletService.js`: Operaciones blockchain
- `businessWalletService.js`: Wallets de emprendimientos
- `centralWalletService.js`: Wallet central del sistema
- `userWalletService.js`: Wallets de usuarios

**Transacciones y Pagos**
- `userPaymentService.js`: Pagos a comerciantes
- `userRechargeService.js`: Recargas de saldo
- `userWithdrawalService.js`: Solicitudes de retiro
- `settlementService.js`: Liquidaciones de emprendimientos

**Administración**
- `adminUserService.js`: Gestión de usuarios
- `adminEventService.js`: Gestión de eventos
- `adminTransactionService.js`: Transacciones
- `adminAuditService.js`: Auditoría
- `adminReportService.js`: Reportes

**Otros**
- `emailService.js`: Envío de emails
- `storageService.js`: Gestión de archivos
- `currencyService.js`: Conversión de monedas
- `auditService.js`: Registro de auditoría
- `userEventService.js`: Eventos para usuarios
- `userNotificationService.js`: Notificaciones
- `userProfileService.js`: Perfil de usuario
- `centralWalletSettingsService.js`: Configuración de wallet central

### Repositorios (Repositories)

Los repositorios manejan el acceso directo a la base de datos (13 repositorios):

- User Repository
- Wallet Repository
- Transaction Repository
- Event Repository
- Event Business Repository
- Event Business Member Repository
- Event Business Wallet Repository
- Audit Log Repository
- Report Repository
- Central Wallet Activity Repository
- Central Wallet Settings Repository
- Settlement Request Repository
- Withdrawal Request Repository

### Middleware

**Autenticación (authMiddleware.js)**
- `authenticate`: Verifica JWT token
- `authorize`: Verifica roles (super_admin, admin, user)

**Upload (uploadMiddleware.js)**
- `eventImageUpload`: Manejo de imágenes de eventos
- Soporte para almacenamiento local y cloud (configurable)

---

## Frontend - Interfaz de Usuario

### Arquitectura del Frontend

El frontend está organizado en módulos independientes con componentes reutilizables.

### Módulos Principales

#### 1. Módulo Admin (`/admin`)

**Páginas de Administración (12 páginas):**
1. **AdminDashboard**: Panel principal con estadísticas
2. **UserManagement**: Gestión completa de usuarios
3. **EventManagement**: Administración de eventos
4. **EventBusinesses**: Gestión de emprendimientos por evento
5. **TransactionManagement**: Listado y verificación de transacciones
6. **CentralWallet**: Gestión de wallet central
7. **SettlementRequests**: Aprobación de liquidaciones
8. **WithdrawalRequests**: Aprobación de retiros
9. **AuditLogs**: Visualización de logs de auditoría
10. **Reports**: Generación y visualización de reportes
11. **Settings**: Configuración del sistema (email, etc.)
12. **AdminProfile**: Perfil del administrador

**Componentes Admin:**
- `AdminLayout`: Layout principal con sidebar
- `AdminNavbar`: Barra de navegación superior
- `AdminSidebar`: Menú lateral
- `Pagination`: Componente de paginación
- `ConfirmModal`: Modal de confirmación

**Servicios Admin:**
- `users.ts`: API de usuarios
- `events.ts`: API de eventos
- `transactions.ts`: API de transacciones
- `auditLogs.ts`: API de auditoría
- `reports.ts`: API de reportes
- `centralWallet.ts`: API de wallet central

#### 2. Módulo User (`/user`)

**Páginas de Usuario (14 páginas):**
1. **Dashboard**: Panel principal del usuario
2. **Profile**: Visualización de perfil
3. **EditProfile**: Edición de perfil
4. **ChangePassword**: Cambio de contraseña
5. **Send**: Envío de tokens
6. **Receive**: Recepción de tokens (QR)
7. **Pay**: Pago a comerciantes (QR)
8. **Recharge**: Solicitud de recarga
9. **Withdraw**: Solicitud de retiro
10. **Transactions**: Historial de transacciones
11. **Events**: Listado de eventos
12. **EventOrganizer**: Vista de organizador de eventos
13. **Notifications**: Centro de notificaciones
14. **Settings**: Configuración de usuario

**Componentes User:**
- `UserLayout`: Layout principal
- `UserNavbar`: Barra de navegación
- `UserSidebar`: Menú lateral
- `BottomNavbar`: Navegación inferior (móvil)

**Servicios User:**
- `profile.ts`: API de perfil
- `events.ts`: API de eventos de usuario
- `notifications.ts`: API de notificaciones

### Hooks Personalizados

El frontend incluye 3 custom hooks:
1. Hook de autenticación
2. Hook de wallet
3. Hook de notificaciones

### Configuración TypeScript

El proyecto usa TypeScript con configuración estricta:
- Strict mode habilitado
- Path aliases configurados (`@/*` → `./src/*`)
- Target: ES2020
- JSX: react-jsx

### Estilos

**Tailwind CSS** está configurado para:
- Diseño responsive (móvil primero)
- Tema personalizado
- Componentes reutilizables
- Utilidades personalizadas

---

## Base de Datos

### Esquema de Base de Datos

La base de datos PostgreSQL contiene 18 migraciones que definen el esquema completo.

#### Tablas Principales

**1. migrations**
- Control de versiones de migraciones
- Campos: id, migration_name, executed_at

**2. roles**
- Roles del sistema
- Valores: super_admin, admin, user

**3. users**
- Información de usuarios
- Campos: id, email, password_hash, first_name, last_name, role_id, wallet_id, status, permissions, created_at, updated_at

**4. wallets**
- Wallets Ethereum encriptadas
- Campos: id, address, encrypted_private_key, balance, created_at, updated_at

**5. events**
- Eventos con emprendimientos
- Campos: id, name, description, location, start_date, end_date, status, organizer_id, cover_image, images, created_at

**6. event_businesses**
- Emprendimientos dentro de eventos
- Campos: id, event_id, name, description, owner_id, group_id, status, created_at

**7. event_business_members**
- Miembros de emprendimientos
- Campos: id, business_id, user_id, role, joined_at

**8. event_business_wallets**
- Wallets de emprendimientos
- Campos: id, business_id, wallet_id, created_at

**9. transactions**
- Historial de transacciones blockchain
- Campos: id, from_wallet_id, to_wallet_id, amount, tx_hash, status, type, description, created_at

**10. audit_logs**
- Logs de auditoría del sistema
- Campos: id, user_id, action, entity_type, entity_id, changes, ip_address, user_agent, created_at

**11. reports**
- Reportes generados
- Campos: id, title, type, data, generated_by, generated_at

**12. central_wallet_activity**
- Actividad de wallet central
- Campos: id, activity_type, amount, from_address, to_address, tx_hash, description, created_at

**13. central_wallet_settings**
- Configuración de wallet central
- Campos: id, setting_key, setting_value, updated_at

**14. settlement_requests**
- Solicitudes de liquidación de emprendimientos
- Campos: id, business_id, requested_by, amount, status, approved_by, processed_at, tx_hash, created_at

**15. withdrawal_requests**
- Solicitudes de retiro de usuarios
- Campos: id, user_id, amount, destination_address, status, approved_by, processed_at, tx_hash, created_at

### Relaciones

```
users (1) ─────> (1) wallets
users (1) ─────> (*) events (organizer)
users (1) ─────> (*) event_business_members
events (1) ─────> (*) event_businesses
event_businesses (1) ─────> (*) event_business_members
event_businesses (1) ─────> (1) event_business_wallets
wallets (1) ─────> (*) transactions (from)
wallets (1) ─────> (*) transactions (to)
users (1) ─────> (*) audit_logs
users (1) ─────> (*) settlement_requests
users (1) ─────> (*) withdrawal_requests
```

### Sistema de Migraciones

Las migraciones se ejecutan automáticamente:

**Desarrollo**: Al iniciar el servidor
**Producción**: Mediante script `start-production.js`

Comandos disponibles:
```bash
npm run migrate        # Ejecutar migraciones pendientes
npm run migrate:force  # Forzar ejecución (ignora errores)
npm run seed          # Crear super admin
```

---

## Integración Blockchain

### Ethereum Sepolia Testnet

El sistema está integrado con la red de prueba Sepolia de Ethereum.

### Ethers.js v6

**Funcionalidades implementadas:**

1. **Creación de Wallets**
   - Generación de pares de llaves (privada/pública)
   - Encriptación de llaves privadas
   - Almacenamiento seguro en base de datos

2. **Gestión de Balance**
   - Consulta de balance en ETH
   - Conversión a formato legible

3. **Transacciones**
   - Envío de ETH entre wallets
   - Firma de transacciones
   - Tracking de transacciones (tx_hash)
   - Verificación de estado

4. **Provider RPC**
   - Conexión a Sepolia vía Infura
   - Manejo de reconexiones
   - Gestión de errores de red

### Seguridad de Wallets

**Encriptación:**
- Las llaves privadas se encriptan usando AES-256
- ENCRYPTION_KEY de 32 caracteres
- Almacenamiento seguro en PostgreSQL

**Proceso de Encriptación:**
```javascript
1. Generar wallet → obtener private key
2. Encriptar private key con ENCRYPTION_KEY
3. Almacenar encrypted_private_key en DB
4. Para transacciones: desencriptar → firmar → volver a encriptar
```

### Tipos de Transacciones

1. **P2P (Peer to Peer)**: Entre usuarios normales
2. **MERCHANT_PAYMENT**: Pagos a comerciantes
3. **RECHARGE**: Recargas aprobadas por admin
4. **WITHDRAWAL**: Retiros aprobados por admin
5. **SETTLEMENT**: Liquidaciones de emprendimientos
6. **CENTRAL_WALLET**: Operaciones de wallet central

---

## Sistema de Autenticación

### JWT (JSON Web Tokens)

**Flujo de Autenticación:**

1. Usuario envía credenciales (email/password)
2. Servidor valida credenciales
3. Servidor genera JWT con payload:
   ```json
   {
     "userId": 123,
     "email": "user@example.com",
     "role": "user"
   }
   ```
4. Cliente almacena token (localStorage)
5. Cliente envía token en header: `Authorization: Bearer <token>`
6. Servidor valida token en cada petición protegida

### Roles y Permisos

**Tres niveles de acceso:**

1. **super_admin**
   - Acceso total al sistema
   - Gestión de todos los usuarios
   - Configuración del sistema
   - No puede ser eliminado

2. **admin**
   - Gestión de usuarios regulares
   - Gestión de eventos y emprendimientos
   - Aprobación de transacciones
   - Visualización de reportes

3. **user**
   - Gestión de su wallet
   - Envío y recepción de fondos
   - Participación en eventos
   - Solicitudes de recarga/retiro

### Middleware de Autorización

```javascript
// Requiere autenticación
router.get('/protected', authenticate, handler);

// Requiere autenticación + rol específico
router.get('/admin', authenticate, authorize('admin', 'super_admin'), handler);
```

### Recuperación de Contraseña

**Flujo:**
1. Usuario solicita reset (forgot-password)
2. Sistema genera token único
3. Envía email con link de reset
4. Usuario accede al link (válido 1 hora)
5. Usuario establece nueva contraseña
6. Token se invalida

---

## Deployment

### Backend en Railway

**Configuración:**

Archivo `railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start:production",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Archivo `nixpacks.toml`:
```toml
[phases.setup]
nixPkgs = ["nodejs-18_x", "npm-9_x"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = []

[start]
cmd = "npm run start:production"
```

**Variables de Entorno Requeridas en Railway:**
- DATABASE_URL (provisto automáticamente por Railway)
- ENCRYPTION_KEY
- JWT_SECRET
- SEPOLIA_RPC_URL
- EMAIL_PROVIDER y credenciales correspondientes
- FRONTEND_URL

**Scripts de Production:**
```json
{
  "start": "node src/scripts/start-production.js",
  "start:production": "node src/scripts/start-production.js"
}
```

### Frontend en Vercel

**Configuración:**

Archivo `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Variables de Entorno en Vercel:**
- `VITE_API_URL`: URL del backend en Railway

**Build Settings:**
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### PostgreSQL Database

**Opciones:**

1. **Railway PostgreSQL**: Plugin automático
2. **Heroku Postgres**: Alternativa
3. **Supabase**: Con interfaz gráfica
4. **Neon.tech**: Serverless PostgreSQL

---

## API Endpoints

### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Registro de usuario | No |
| POST | `/login` | Inicio de sesión | No |
| POST | `/forgot-password` | Solicitar reset de contraseña | No |
| POST | `/reset-password` | Reset de contraseña con token | No |
| GET | `/me` | Obtener usuario actual | Sí |

### Wallet (`/api/wallet`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/balance` | Obtener balance de wallet | Sí |
| POST | `/send` | Enviar tokens | Sí |
| GET | `/history` | Historial de transacciones | Sí |
| GET | `/recipients/search` | Buscar destinatarios | Sí |
| GET | `/merchants/search` | Buscar comerciantes | Sí |
| POST | `/merchants/pay` | Pagar a comerciante | Sí |
| POST | `/recharge` | Solicitar recarga | Sí |
| POST | `/withdrawals` | Solicitar retiro | Sí |
| GET | `/withdrawals` | Listar mis retiros | Sí |

### Usuario (`/api/user`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/profile` | Obtener perfil | Sí |
| GET | `/events` | Listar mis eventos | Sí |
| GET | `/events/organizer/:eventId` | Detalle de evento como organizador | Sí |
| POST | `/events/:eventId/businesses/:businessId/settlement` | Solicitar liquidación | Sí |
| GET | `/events/:eventId/businesses/:businessId/settlement` | Estado de liquidación | Sí |
| GET | `/notifications` | Listar notificaciones | Sí |

### Admin - Usuarios (`/api/admin/users`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar usuarios | Admin |
| GET | `/roles` | Listar roles | Admin |
| GET | `/search` | Buscar usuarios | Admin |
| POST | `/` | Crear usuario | Admin |
| PUT | `/:id` | Actualizar usuario | Admin |
| DELETE | `/:id` | Eliminar usuario | Admin |

### Admin - Eventos (`/api/admin/events`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar eventos | Admin |
| GET | `/:eventId` | Obtener evento | Admin |
| POST | `/` | Crear evento | Admin |
| PUT | `/:eventId` | Actualizar evento | Admin |
| DELETE | `/:eventId` | Eliminar evento | Admin |
| GET | `/:eventId/businesses` | Listar emprendimientos | Admin |
| POST | `/:eventId/businesses` | Crear emprendimiento | Admin |
| PUT | `/:eventId/businesses/:businessId` | Actualizar emprendimiento | Admin |
| DELETE | `/:eventId/businesses/:businessId` | Eliminar emprendimiento | Admin |
| POST | `/:eventId/businesses/:businessId/members` | Agregar miembro | Admin |
| DELETE | `/:eventId/businesses/:businessId/members/:memberId` | Remover miembro | Admin |

### Admin - Transacciones (`/api/admin/transactions`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar transacciones | Admin |
| POST | `/check-pending` | Verificar transacciones pendientes | Admin |

### Admin - Wallet Central (`/api/admin/central-wallet`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/status` | Estado de wallet central | Admin |
| GET | `/config` | Obtener configuración | Admin |
| PUT | `/config` | Actualizar configuración | Admin |
| GET | `/activity` | Actividad de wallet | Admin |
| GET | `/settlements` | Listar liquidaciones | Admin |
| POST | `/settlements/:settlementId/approve` | Aprobar liquidación | Admin |
| POST | `/settlements/:settlementId/reject` | Rechazar liquidación | Admin |
| GET | `/withdrawals` | Listar retiros | Admin |
| POST | `/withdrawals/:withdrawalId/approve` | Aprobar retiro | Admin |
| POST | `/withdrawals/:withdrawalId/reject` | Rechazar retiro | Admin |

### Admin - Auditoría (`/api/admin/audit`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/logs` | Listar logs de auditoría | Admin |

### Admin - Reportes (`/api/admin/reports`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar reportes | Admin |

### Admin - Configuración (`/api/admin/settings`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/email` | Obtener config de email | Admin |
| PUT | `/email` | Guardar config de email | Admin |

---

## Variables de Entorno

### Backend (.env)

```bash
# Entorno
NODE_ENV=development|production

# Base de Datos
DATABASE_URL=postgresql://user:password@host:port/database
# O usar variables individuales:
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=mises_wallet
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Servidor
PORT=3000

# Seguridad
ENCRYPTION_KEY=your-32-character-encryption-key
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d

# Blockchain
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# URLs
FRONTEND_URL=http://localhost:5174
CORS_ORIGIN=http://localhost:5174

# Email Provider (elegir uno)
EMAIL_PROVIDER=resend|mailtrap|smtp

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Mailtrap
MAILTRAP_API_TOKEN=xxxxxxxxxxxxx
MAILTRAP_FROM_EMAIL=noreply@yourdomain.com
MAILTRAP_FROM_NAME=Mises Wallet

# SMTP Genérico
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@example.com
SMTP_PASS=your_password
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=Mises Wallet

# Opciones de Migración
RUN_MIGRATIONS_ON_START=true|false
RUN_SEEDER_ON_START=true|false

# Storage (opcional para cloud storage)
STORAGE_TYPE=local|cloudinary|s3
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (.env.local)

```bash
VITE_API_URL=http://localhost:3000
```

### Docker Compose (.env)

```bash
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=mises_wallet

# Backend
NODE_ENV=development
ENCRYPTION_KEY=change-this-to-a-strong-random-key-in-production-32-chars
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Frontend
FRONTEND_URL=http://localhost:5174

# Email
EMAIL_PROVIDER=resend
RESEND_API_KEY=your_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# pgAdmin
PGADMIN_EMAIL=admin@mises-wallet.com
PGADMIN_PASSWORD=admin
```

---

## Scripts Disponibles

### Backend Scripts

```bash
# Desarrollo
npm run dev                 # Iniciar con nodemon (hot reload)
npm run start:dev          # Iniciar sin hot reload

# Producción
npm start                  # Iniciar en modo producción
npm run start:production   # Alias para producción
npm run start:with-migrations  # Iniciar con migraciones

# Base de Datos
npm run migrate            # Ejecutar migraciones
npm run migrate:force      # Forzar migraciones (ignora errores)
npm run seed               # Ejecutar seeders (crear super admin)

# Testing
npm test                   # Ejecutar tests (no implementado aún)
```

### Frontend Scripts

```bash
# Desarrollo
npm run dev                # Iniciar dev server (Vite)

# Producción
npm run build              # Build para producción (TypeScript + Vite)
npm run preview            # Preview del build de producción

# Calidad de Código
npm run lint               # Ejecutar ESLint
```

### Docker Commands

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend

# Detener servicios
docker-compose down

# Rebuild servicios
docker-compose up -d --build

# Ejecutar comandos en contenedores
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed

# Limpiar volúmenes (CUIDADO: elimina datos)
docker-compose down -v
```

---

## Flujos de Trabajo

### 1. Registro y Onboarding de Usuario

```
1. Usuario completa formulario de registro
   ├── Email (único)
   ├── Contraseña (mínimo 8 caracteres)
   ├── Nombre y apellido
   └── Validación en frontend y backend

2. Backend procesa registro
   ├── Valida datos con express-validator
   ├── Hash de contraseña con bcryptjs
   ├── Crea wallet Ethereum
   │   ├── Genera par de llaves
   │   └── Encripta llave privada
   ├── Guarda usuario en DB
   └── Envía email de bienvenida

3. Usuario recibe credenciales
   ├── JWT token
   ├── Información de usuario
   └── Dirección de wallet

4. Redirección a Dashboard
```

### 2. Envío de Tokens (P2P)

```
1. Usuario accede a página Send
2. Busca destinatario
   ├── Por email
   └── Por dirección de wallet
3. Ingresa cantidad
4. Confirma transacción
5. Backend procesa
   ├── Valida balance suficiente
   ├── Desencripta llave privada del sender
   ├── Crea transacción en blockchain
   ├── Firma con llave privada
   ├── Envía a red Sepolia
   ├── Espera confirmación
   └── Guarda en DB con tx_hash
6. Usuario recibe confirmación
7. Actualización de balances en tiempo real
```

### 3. Pago a Comerciante con QR

```
1. Comerciante genera QR
   ├── Desde su dashboard
   ├── Especifica monto (opcional)
   └── QR contiene dirección de wallet

2. Usuario escanea QR
   ├── Usa cámara en página Pay
   ├── App detecta dirección de wallet
   └── Pre-llena formulario

3. Usuario confirma pago
4. Transacción se procesa
5. Ambas partes reciben confirmación
6. Se registra como MERCHANT_PAYMENT
```

### 4. Solicitud de Recarga

```
1. Usuario solicita recarga
   ├── Especifica monto
   ├── Opcional: comprobante de pago
   └── Descripción

2. Solicitud entra en cola
   └── Estado: PENDING

3. Admin revisa solicitud
   ├── Verifica comprobante
   └── Decide aprobar/rechazar

4. Si aprueba:
   ├── Admin procesa desde wallet central
   ├── Tokens se envían a wallet del usuario
   ├── Estado: APPROVED
   └── Usuario recibe notificación

5. Si rechaza:
   ├── Estado: REJECTED
   ├── Usuario recibe notificación
   └── Se especifica razón
```

### 5. Solicitud de Retiro

```
1. Usuario solicita retiro
   ├── Especifica monto
   ├── Dirección de destino (externa)
   └── Valida balance suficiente

2. Solicitud entra en cola
   └── Estado: PENDING

3. Admin revisa solicitud
   ├── Verifica identidad
   ├── Valida dirección de destino
   └── Decide aprobar/rechazar

4. Si aprueba:
   ├── Tokens se envían a dirección externa
   ├── Se cobra del balance del usuario
   ├── Estado: APPROVED
   └── Usuario recibe confirmación con tx_hash

5. Si rechaza:
   ├── Estado: REJECTED
   └── Usuario recibe notificación con razón
```

### 6. Creación de Evento con Emprendimientos

```
1. Admin crea evento
   ├── Nombre y descripción
   ├── Fechas (inicio/fin)
   ├── Ubicación
   ├── Imagen de portada
   ├── Galería de imágenes
   └── Asigna organizador

2. Admin crea emprendimientos dentro del evento
   ├── Nombre del negocio
   ├── Descripción
   ├── Asigna propietario (owner)
   ├── Sistema crea wallet automáticamente
   └── Asigna grupo (opcional)

3. Admin agrega miembros al emprendimiento
   ├── Selecciona usuarios
   ├── Asigna roles (owner, member)
   └── Miembros reciben notificación

4. Emprendimiento está activo
   └── Puede recibir pagos durante el evento
```

### 7. Liquidación de Fondos de Emprendimiento

```
1. Organizador/Owner del emprendimiento solicita liquidación
   ├── Especifica monto
   ├── Valida balance disponible en wallet del negocio
   └── Crea settlement request

2. Solicitud entra en cola
   └── Estado: PENDING

3. Admin revisa
   ├── Verifica fondos en wallet del negocio
   ├── Valida identidad del solicitante
   └── Decide aprobar/rechazar

4. Si aprueba:
   ├── Fondos se transfieren desde wallet del negocio
   ├── Destino: wallet personal del owner
   ├── Estado: APPROVED
   └── Se registra en central_wallet_activity

5. Si rechaza:
   ├── Estado: REJECTED
   └── Se notifica con razón
```

### 8. Gestión de Wallet Central

```
1. Wallet Central recibe fondos
   ├── Desde recargas externas
   ├── Desde comisiones
   └── Desde depósitos administrativos

2. Wallet Central distribuye fondos
   ├── Aprueba recargas de usuarios
   ├── Procesa retiros
   └── Liquida emprendimientos

3. Configuración de Wallet Central
   ├── Monto mínimo de balance
   ├── Límites de transacción
   └── Reglas de aprobación automática

4. Monitoreo
   ├── Dashboard con balance actual
   ├── Historial de actividad
   ├── Alertas de balance bajo
   └── Reportes financieros
```

### 9. Sistema de Auditoría

```
Cada acción importante se registra:

1. Autenticación
   ├── Login exitoso
   ├── Login fallido
   └── Logout

2. Modificación de datos
   ├── Crear usuario
   ├── Actualizar usuario
   ├── Eliminar usuario
   ├── Cambiar rol
   └── Modificar permisos

3. Transacciones
   ├── Envío de tokens
   ├── Recarga aprobada
   ├── Retiro procesado
   └── Liquidación

4. Configuración
   ├── Cambio de settings
   └── Actualización de wallet central

Cada log incluye:
├── Usuario que realizó la acción
├── Timestamp
├── Tipo de acción
├── Entidad afectada
├── Cambios realizados (antes/después)
├── IP address
└── User agent
```

---

## Seguridad

### Mejores Prácticas Implementadas

1. **Contraseñas**
   - Hash con bcryptjs (10 rounds)
   - Validación de fortaleza en frontend y backend
   - No se almacenan en texto plano

2. **JWT Tokens**
   - Firmados con secret key
   - Expiración configurable
   - Validación en cada petición protegida

3. **Wallets Blockchain**
   - Llaves privadas encriptadas con AES-256
   - ENCRYPTION_KEY de 32 caracteres mínimo
   - Nunca se exponen al cliente

4. **CORS**
   - Configurado para orígenes específicos
   - Credenciales habilitadas solo para dominios permitidos

5. **Validación de Entrada**
   - express-validator en backend
   - Validación en frontend con TypeScript
   - Sanitización de datos

6. **SQL Injection**
   - Uso de prepared statements con pg
   - Parametrización de queries

7. **Rate Limiting**
   - Recomendado: implementar en producción

8. **HTTPS**
   - Obligatorio en producción
   - Railway y Vercel lo proveen automáticamente

---

## Mantenimiento y Monitoreo

### Logs

**Backend Logs:**
```bash
# Ver logs en Docker
docker-compose logs -f backend

# Ver logs en Railway
railway logs --service backend

# Logs incluyen:
├── Conexión a DB
├── Inicio de servidor
├── Ejecución de migraciones
├── Requests HTTP
├── Errores
└── Transacciones blockchain
```

### Health Checks

```bash
# Verificar estado del backend
curl http://localhost:3001/health

# Respuesta:
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Base de Datos

**Backup:**
```bash
# Backup con Docker
docker-compose exec postgres pg_dump -U postgres mises_wallet > backup.sql

# Restore
docker-compose exec -T postgres psql -U postgres mises_wallet < backup.sql
```

**Monitoreo con pgAdmin:**
- Acceder a http://localhost:5051
- Conectar a servidor PostgreSQL
- Dashboard con métricas de rendimiento

### Métricas Recomendadas

1. **Tiempo de respuesta de API**
2. **Tasa de transacciones exitosas/fallidas**
3. **Balance de wallet central**
4. **Número de usuarios activos**
5. **Volumen de transacciones por día**
6. **Errores de blockchain**
7. **Uso de base de datos**

---

## Troubleshooting

### Problemas Comunes

#### Backend no se conecta a la base de datos

```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps

# Verificar variables de entorno
cat .env | grep POSTGRES

# Ver logs de PostgreSQL
docker-compose logs postgres

# Solución: Verificar DATABASE_URL y credenciales
```

#### Migraciones fallan

```bash
# Ver error específico
npm run migrate

# Forzar migración (usa con cuidado)
npm run migrate:force

# Verificar tabla de migraciones
docker-compose exec postgres psql -U postgres -d mises_wallet -c "SELECT * FROM migrations;"

# Reset completo (CUIDADO: elimina datos)
docker-compose down -v
docker-compose up -d
```

#### Transacciones blockchain fallan

```bash
# Verificar RPC URL
echo $SEPOLIA_RPC_URL

# Verificar balance del wallet
# Usar Etherscan Sepolia: https://sepolia.etherscan.io/

# Obtener Sepolia ETH de testnet
# Faucet: https://sepoliafaucet.com/

# Solución común: Verificar gas price y balance
```

#### CORS errors en frontend

```bash
# Verificar CORS_ORIGIN en backend .env
echo $CORS_ORIGIN

# Verificar VITE_API_URL en frontend
echo $VITE_API_URL

# Solución: Asegurar que las URLs coincidan
```

#### Archivos no se suben

```bash
# Verificar directorio uploads
ls -la backend/uploads

# Crear si no existe
mkdir -p backend/uploads/events

# Verificar permisos
chmod -R 755 backend/uploads

# En Docker, verificar volumen
docker-compose exec backend ls -la /app/uploads
```

---

## Contribución

### Guía para Contribuidores

1. **Fork del repositorio**
2. **Crear rama feature**
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. **Hacer commits descriptivos**
   ```bash
   git commit -m "feat: agregar funcionalidad X"
   ```
4. **Push a tu fork**
   ```bash
   git push origin feature/nueva-funcionalidad
   ```
5. **Crear Pull Request**

### Convenciones de Código

**Backend (JavaScript):**
- ES Modules (import/export)
- Camel case para variables y funciones
- Pascal case para clases
- Comentarios en español o inglés
- Async/await para operaciones asíncronas

**Frontend (TypeScript):**
- Functional components con hooks
- Props interfaces tipadas
- Nombres de componentes en Pascal case
- Archivos de componentes con extensión .tsx
- Estilos con Tailwind classes

### Estructura de Commits

```
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: formato de código
refactor: refactorización
test: tests
chore: tareas de mantenimiento
```

---

## Roadmap Futuro

### Funcionalidades Planeadas

1. **Sistema de Notificaciones Push**
   - Web Push API
   - Notificaciones en tiempo real

2. **Aplicación Móvil**
   - React Native
   - Misma API backend

3. **Soporte Multi-Chain**
   - Polygon
   - Binance Smart Chain
   - Otras redes EVM

4. **Exchange Interno**
   - Conversión entre tokens
   - Integración con DEX

5. **Sistema de Referidos**
   - Programa de afiliados
   - Recompensas

6. **Dashboard de Analytics**
   - Métricas avanzadas
   - Visualizaciones

7. **Chat entre Usuarios**
   - Mensajería en tiempo real
   - Socket.IO

8. **Marketplace**
   - Compra/venta de productos
   - Integración con emprendimientos

9. **Tests Automatizados**
   - Jest para backend
   - React Testing Library para frontend
   - E2E con Cypress

10. **CI/CD Pipeline**
    - GitHub Actions
    - Tests automáticos
    - Deploy automático

---

## Licencia

Este proyecto está bajo licencia privada. Todos los derechos reservados.

---

## Contacto y Soporte

Para preguntas, sugerencias o reportar problemas:

- **Email**: support@mises-wallet.com
- **Issues**: [GitHub Issues](https://github.com/your-repo/mises-wallet/issues)
- **Documentación**: Este archivo README.md

---

## Changelog

### Version 1.0.0 (2024)

**Características Iniciales:**
- Sistema completo de autenticación
- Gestión de wallets Ethereum
- Transacciones P2P
- Sistema de eventos y emprendimientos
- Panel de administración
- Wallet central
- Sistema de recargas y retiros
- Auditoría completa
- Reportes básicos

**Tecnologías:**
- Backend: Node.js + Express
- Frontend: React + TypeScript + Vite
- Database: PostgreSQL 15
- Blockchain: Ethereum Sepolia
- Deployment: Railway + Vercel

---

Última actualización: Noviembre 2024

