# Mises Wallet - Frontend

Frontend para Mises Wallet construido con React, TypeScript y Tailwind CSS.

## Estructura del Proyecto

```
frontend/
├── public/             # Archivos estáticos
├── src/
│   ├── assets/        # Recursos (imágenes, iconos)
│   ├── components/    # Componentes React
│   │   ├── admin/     # Componentes de administración
│   │   ├── auth/      # Componentes de autenticación
│   │   ├── common/    # Componentes comunes
│   │   ├── events/    # Componentes de eventos
│   │   ├── layout/    # Componentes de layout
│   │   ├── notifications/ # Componentes de notificaciones
│   │   ├── profile/   # Componentes de perfil
│   │   ├── qr/       # Componentes QR
│   │   └── wallet/    # Componentes de wallet
│   ├── contexts/      # Contextos de React
│   ├── hooks/         # Custom hooks
│   ├── pages/         # Páginas de la aplicación
│   ├── services/      # Servicios (API, etc.)
│   ├── styles/        # Estilos globales
│   ├── utils/         # Utilidades
│   ├── App.tsx        # Componente principal
│   └── main.tsx       # Punto de entrada
├── index.html
└── package.json
```

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

La aplicación se ejecutará en `http://localhost:5174`

## Producción

```bash
npm run build
npm run preview
```

## Variables de Entorno

Crea un archivo `.env` en la raíz del frontend con:

```env
VITE_API_URL=http://localhost:3001
```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter

## Tecnologías

- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de CSS utility-first
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP

