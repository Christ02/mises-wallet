/**
 * Storage Service
 * 
 * Servicio para manejar almacenamiento de archivos en cloud storage (S3-compatible)
 * Compatible con: AWS S3, Cloudflare R2, DigitalOcean Spaces, etc.
 * 
 * Para usar Cloudflare R2:
 * 1. Crear cuenta en Cloudflare
 * 2. Crear bucket R2
 * 3. Obtener Account ID, Access Key ID, Secret Access Key
 * 4. Configurar variables de entorno (ver .env.example)
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';

class StorageService {
  constructor() {
    // Configuración para Cloudflare R2 o AWS S3
    const endpoint = process.env.STORAGE_ENDPOINT; // Para R2: https://<account-id>.r2.cloudflarestorage.com
    const region = process.env.STORAGE_REGION || 'auto'; // Para R2: 'auto'
    const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID;
    const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY;
    const bucketName = process.env.STORAGE_BUCKET_NAME;
    const publicUrl = process.env.STORAGE_PUBLIC_URL; // URL pública del bucket (con CDN si aplica)

    if (!accessKeyId || !secretAccessKey || !bucketName) {
      console.warn('⚠️  Storage Service: Variables de entorno no configuradas. Usando almacenamiento local.');
      this.useLocalStorage = true;
      this.localStoragePath = path.join(process.cwd(), 'uploads');
      return;
    }

    this.useLocalStorage = false;
    this.bucketName = bucketName;
    this.publicUrl = publicUrl || `https://${bucketName}.s3.amazonaws.com`; // Fallback para S3

    this.s3Client = new S3Client({
      endpoint: endpoint, // Para R2, necesario. Para S3, undefined usa default
      region: region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      // Para R2, no usar signature v4
      ...(endpoint && endpoint.includes('r2.cloudflarestorage.com') && {
        forcePathStyle: true,
      }),
    });
  }

  /**
   * Subir archivo a cloud storage
   * @param {Buffer|Stream} fileBuffer - Contenido del archivo
   * @param {string} fileName - Nombre del archivo (con path relativo)
   * @param {string} contentType - MIME type del archivo
   * @returns {Promise<string>} URL pública del archivo
   */
  async uploadFile(fileBuffer, fileName, contentType) {
    if (this.useLocalStorage) {
      return this.uploadFileLocal(fileBuffer, fileName);
    }

    try {
      const key = `events/${fileName}`; // Path en el bucket

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        // Para hacer el archivo público (si el bucket lo permite)
        // ACL: 'public-read', // Solo si el bucket tiene ACL habilitado
      });

      await this.s3Client.send(command);

      // Construir URL pública
      const publicUrl = this.publicUrl.endsWith('/') 
        ? `${this.publicUrl}${key}` 
        : `${this.publicUrl}/${key}`;

      return publicUrl;
    } catch (error) {
      console.error('Error subiendo archivo a cloud storage:', error);
      throw new Error('No se pudo subir el archivo');
    }
  }

  /**
   * Eliminar archivo de cloud storage
   * @param {string} fileUrl - URL completa del archivo o key relativo
   * @returns {Promise<void>}
   */
  async deleteFile(fileUrl) {
    if (this.useLocalStorage) {
      return this.deleteFileLocal(fileUrl);
    }

    try {
      // Extraer key del URL o usar directamente si es un key
      let key = fileUrl;
      if (fileUrl.startsWith('http')) {
        // Extraer key de la URL
        const urlParts = new URL(fileUrl);
        key = urlParts.pathname.startsWith('/') 
          ? urlParts.pathname.slice(1) 
          : urlParts.pathname;
      }

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error eliminando archivo de cloud storage:', error);
      // No lanzar error para no romper el flujo si el archivo ya no existe
    }
  }

  /**
   * Eliminar múltiples archivos
   * @param {string[]} fileUrls - Array de URLs o keys
   * @returns {Promise<void>}
   */
  async deleteFiles(fileUrls) {
    await Promise.all(fileUrls.map(url => this.deleteFile(url)));
  }

  /**
   * Obtener URL firmada (para archivos privados)
   * @param {string} key - Key del archivo en el bucket
   * @param {number} expiresIn - Segundos hasta que expire (default: 1 hora)
   * @returns {Promise<string>} URL firmada
   */
  async getSignedUrl(key, expiresIn = 3600) {
    if (this.useLocalStorage) {
      return this.getLocalUrl(key);
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      console.error('Error generando URL firmada:', error);
      throw new Error('No se pudo generar URL firmada');
    }
  }

  // ========== Métodos para almacenamiento local (fallback) ==========

  async uploadFileLocal(fileBuffer, fileName) {
    const uploadDir = path.join(this.localStoragePath, 'events');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, fileBuffer);

    return `/uploads/events/${fileName}`;
  }

  async deleteFileLocal(fileUrl) {
    try {
      // fileUrl puede ser "/uploads/events/filename.jpg" o solo "filename.jpg"
      const fileName = fileUrl.includes('/') 
        ? path.basename(fileUrl) 
        : fileUrl;
      const filePath = path.join(this.localStoragePath, 'events', fileName);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error eliminando archivo local:', error);
    }
  }

  getLocalUrl(key) {
    return `/uploads/${key}`;
  }
}

// Singleton instance
export default new StorageService();

