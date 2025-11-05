import crypto from 'crypto';
import { config } from '../config/config.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

export class EncryptionService {
  static getEncryptionKey() {
    const key = process.env.ENCRYPTION_KEY || config.encryption?.key;
    if (!key) {
      throw new Error('ENCRYPTION_KEY no configurada');
    }
    return crypto.createHash('sha256').update(key).digest();
  }

  static encrypt(text) {
    try {
      const key = this.getEncryptionKey();
      const iv = crypto.randomBytes(IV_LENGTH);
      const salt = crypto.randomBytes(SALT_LENGTH);
      
      const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return salt.toString('hex') + 
             iv.toString('hex') + 
             tag.toString('hex') + 
             encrypted;
    } catch (error) {
      throw new Error(`Error al encriptar: ${error.message}`);
    }
  }

  static decrypt(encryptedText) {
    try {
      const key = this.getEncryptionKey();
      
      const salt = Buffer.from(encryptedText.slice(0, SALT_LENGTH * 2), 'hex');
      const iv = Buffer.from(encryptedText.slice(SALT_LENGTH * 2, TAG_POSITION * 2), 'hex');
      const tag = Buffer.from(encryptedText.slice(TAG_POSITION * 2, ENCRYPTED_POSITION * 2), 'hex');
      const encrypted = encryptedText.slice(ENCRYPTED_POSITION * 2);
      
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Error al desencriptar: ${error.message}`);
    }
  }
}

