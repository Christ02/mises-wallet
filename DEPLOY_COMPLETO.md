# 🚀 Deploy Completo - Mises Wallet

## ✅ Estado Actual

### Railway (Backend + Base de Datos)
- ✅ Proyecto: `mises-wallet-backend`
- ✅ PostgreSQL: Desplegado y funcionando
- ✅ Backend: Servicio `mises-wallet` creado
- ✅ Variables de entorno: Configuradas
- ✅ Dominio: https://mises-wallet-production.up.railway.app

### Vercel (Frontend)
- ✅ Proyecto: `mises-wallet` (nueva cuenta)
- ✅ Linkeado: Conectado al repositorio GitHub
- ✅ Variable `VITE_API_URL`: Configurada
- ✅ Build: Configurado en `vercel.json`
- ✅ Dominio temporal: https://mises-wallet-eftxei6vd-christians-projects-630693d2.vercel.app

## 🔗 URLs de Producción

**Backend (Railway):**
- https://mises-wallet-production.up.railway.app

**Frontend (Vercel):**
- Temporal: https://mises-wallet-eftxei6vd-christians-projects-630693d2.vercel.app
- Producción: https://mises-wallet.vercel.app (después del primer deploy)

## ✅ Variables Configuradas

### Railway (Backend)
- ✅ `DATABASE_URL` - Conectado a PostgreSQL
- ✅ `NODE_ENV` = `production`
- ✅ `PORT` = `3000`
- ✅ `JWT_SECRET` - Generado y configurado
- ✅ `ENCRYPTION_KEY` - Generado y configurado
- ✅ `SEPOLIA_RPC_URL` - Configurado
- ✅ `CORS_ORIGIN` - Actualizado con dominio de Vercel
- ✅ `FRONTEND_URL` - Actualizado con dominio de Vercel
- ✅ `EMAIL_PROVIDER` = `resend`
- ✅ `CURRENCY_RATE_GTQ` = `1`

### Vercel (Frontend)
- ✅ `VITE_API_URL` = `https://mises-wallet-production.up.railway.app`

## ⚠️ Pendiente (Manual)

### Railway
1. **Root Directory**: En Railway Dashboard → Settings → Service → Root Directory: `backend`
   - Esto es CRÍTICO para que el build funcione

2. **Ejecutar Migraciones**: Después del build exitoso
   ```bash
   railway run npm run migrate
   ```

### Vercel
1. **Esperar Build**: El primer deploy puede tardar unos minutos
2. **Verificar Dominio**: Una vez termine, obtendrás el dominio de producción
3. **Actualizar CORS**: Si el dominio cambia, actualizar en Railway

## 🔧 Comandos Útiles

### Railway
```bash
# Ver logs
railway logs

# Ejecutar migraciones
railway run npm run migrate

# Ver variables
railway variables

# Ver servicios
railway service
```

### Vercel
```bash
# Ver deployments
vercel ls

# Ver variables
vercel env ls

# Ver logs
vercel logs

# Redeploy
vercel --prod
```

## 📋 Checklist Final

### Railway
- [x] Proyecto creado
- [x] PostgreSQL desplegado
- [x] Servicio backend creado
- [x] Variables de entorno configuradas
- [ ] Root Directory configurado a `backend` (CRÍTICO)
- [ ] Build exitoso
- [ ] Migraciones ejecutadas
- [ ] Servicio corriendo

### Vercel
- [x] Proyecto creado y linkeado
- [x] Variable `VITE_API_URL` configurada
- [x] Build configurado
- [ ] Build exitoso
- [ ] Frontend funcionando
- [ ] Conectado al backend

### Integración
- [x] CORS configurado en Railway
- [x] FRONTEND_URL configurado en Railway
- [ ] Frontend puede hacer peticiones al backend
- [ ] Login/Registro funcionando

## 🎯 Próximos Pasos

1. **Configurar Root Directory en Railway** (paso crítico)
2. **Esperar build de Railway** y verificar que funcione
3. **Ejecutar migraciones** en Railway
4. **Esperar build de Vercel** y verificar que funcione
5. **Probar conexión** entre frontend y backend
6. **Actualizar dominios** si es necesario

---

¡Casi listo! Solo falta configurar el Root Directory en Railway y ejecutar las migraciones. 🚀

