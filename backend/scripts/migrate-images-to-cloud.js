/**
 * Script para migrar imágenes existentes de almacenamiento local a cloud storage
 * 
 * Uso:
 * node scripts/migrate-images-to-cloud.js
 * 
 * Requiere:
 * - Variables de entorno configuradas para cloud storage
 * - Imágenes existentes en backend/uploads/events/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import storageService from '../src/services/storageService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'events');

async function migrateImages() {
  console.log('🚀 Iniciando migración de imágenes a cloud storage...\n');

  // Verificar que storage service esté configurado
  if (storageService.useLocalStorage) {
    console.error('❌ Error: Cloud storage no está configurado.');
    console.error('   Configura las variables de entorno STORAGE_* en .env');
    process.exit(1);
  }

  // Verificar que existe el directorio de uploads
  if (!fs.existsSync(UPLOADS_DIR)) {
    console.log('ℹ️  No hay imágenes para migrar.');
    return;
  }

  // Leer archivos
  const files = fs.readdirSync(UPLOADS_DIR);
  const imageFiles = files.filter(file => 
    /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
  );

  if (imageFiles.length === 0) {
    console.log('ℹ️  No hay imágenes para migrar.');
    return;
  }

  console.log(`📦 Encontradas ${imageFiles.length} imágenes para migrar.\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const fileName of imageFiles) {
    try {
      const filePath = path.join(UPLOADS_DIR, fileName);
      const fileBuffer = fs.readFileSync(filePath);
      
      // Determinar content type
      const ext = path.extname(fileName).toLowerCase();
      const contentTypeMap = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
      };
      const contentType = contentTypeMap[ext] || 'image/jpeg';

      // Subir a cloud storage
      const publicUrl = await storageService.uploadFile(
        fileBuffer,
        fileName,
        contentType
      );

      console.log(`✅ ${fileName} -> ${publicUrl}`);
      successCount++;

      // Opcional: Eliminar archivo local después de migrar
      // Descomentar si quieres eliminar los archivos locales después de migrar
      // fs.unlinkSync(filePath);
      // console.log(`   🗑️  Eliminado archivo local`);

    } catch (error) {
      console.error(`❌ Error migrando ${fileName}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n📊 Resumen:');
  console.log(`   ✅ Exitosas: ${successCount}`);
  console.log(`   ❌ Errores: ${errorCount}`);
  console.log('\n✨ Migración completada!');
  
  if (successCount > 0) {
    console.log('\n⚠️  IMPORTANTE:');
    console.log('   1. Verifica que las imágenes se subieron correctamente');
    console.log('   2. Actualiza las URLs en la base de datos si es necesario');
    console.log('   3. Una vez verificado, puedes eliminar los archivos locales');
  }
}

migrateImages().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});

