# ▲ Vercel Setup - Mises Wallet Frontend

## 🚀 Crear Proyecto en Vercel

Ejecuta desde la raíz del proyecto:

```bash
vercel
```

Seguir las instrucciones:
- **Set up and deploy?** → Yes
- **Which scope?** → Tu cuenta
- **Link to existing project?** → No
- **What's your project's name?** → `mises-wallet-frontend`
- **In which directory is your code located?** → `./frontend`
- **Want to override the settings?** → No (usa vercel.json)

## 🔐 Variables de Entorno

Después de crear el proyecto, configurar en Vercel Dashboard → Settings → Environment Variables:

```
VITE_API_URL = https://mises-wallet-production.up.railway.app
```

**Importante**: Sin el `/api` al final, ya que el frontend lo agrega automáticamente.

## ✅ Configuración Automática

El archivo `vercel.json` ya está configurado con:
- ✅ Build command: `cd frontend && npm install && npm run build`
- ✅ Output directory: `frontend/dist`
- ✅ Framework: Vite
- ✅ Rewrites para SPA (React Router)
- ✅ Headers de cache para assets

## 🔗 Conectar con Railway

1. **Actualizar CORS en Railway**:
   - Agregar el dominio de Vercel a `CORS_ORIGIN` en Railway
   - Ejemplo: `CORS_ORIGIN=https://mises-wallet-frontend.vercel.app`

2. **Actualizar FRONTEND_URL en Railway**:
   - Cambiar `FRONTEND_URL` al dominio de Vercel
   - Ejemplo: `FRONTEND_URL=https://mises-wallet-frontend.vercel.app`

## 📝 Notas

- Vercel detectará automáticamente Vite
- El build se ejecuta en `frontend/`
- Los assets se sirven desde `frontend/dist/`
- El dominio se genera automáticamente

