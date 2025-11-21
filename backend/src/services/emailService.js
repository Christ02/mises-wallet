import { Resend } from 'resend';
import nodemailer from 'nodemailer';

class EmailService {
  static resend = null;
  static smtpTransporter = null;

  static initializeResend() {
    if (this.resend) {
      return this.resend;
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return null;
    }

    this.resend = new Resend(apiKey);
    return this.resend;
  }

  static initializeSmtp() {
    if (this.smtpTransporter) {
      return this.smtpTransporter;
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '2525');
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpSecure = process.env.SMTP_SECURE === 'true';

    if (!smtpHost || !smtpUser || !smtpPass) {
      return null;
    }

    this.smtpTransporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    return this.smtpTransporter;
  }

  static async sendEmail({ to, subject, html, text, from }) {
    try {
      const emailProvider = process.env.EMAIL_PROVIDER || 'resend'; // 'resend', 'mailtrap' o 'smtp'
      console.log(`📧 [Email Service] Provider: ${emailProvider}`);

      if (emailProvider === 'mailtrap' || emailProvider === 'smtp') {
        // Usar Mailtrap SMTP para pruebas
        const transporter = this.initializeSmtp();
        if (!transporter) {
          console.log('📧 [Email no enviado - SMTP no configurado]');
          console.log(`   Para: ${to}`);
          console.log(`   Asunto: ${subject}`);
          console.log(`   Contenido: ${text || 'HTML'}`);
          return { success: true, message: 'Email logged (SMTP not configured)' };
        }

        const fromEmail = from || process.env.MAILTRAP_FROM_EMAIL || process.env.SMTP_FROM_EMAIL || 'noreply@mises-wallet.com';
        const fromName = process.env.MAILTRAP_FROM_NAME || process.env.SMTP_FROM_NAME || 'Mises Wallet';

        console.log(`📧 [Mailtrap SMTP] Enviando email a: ${to}`);
        console.log(`📧 [Mailtrap SMTP] Desde: ${fromEmail} (${fromName})`);
        console.log(`📧 [Mailtrap SMTP] Asunto: ${subject}`);

        const mailOptions = {
          from: `"${fromName}" <${fromEmail}>`,
          to: to,
          subject: subject,
          html: html,
          text: text || html.replace(/<[^>]*>/g, '')
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email enviado via Mailtrap SMTP:', info.messageId);
        return { success: true, messageId: info.messageId };
      } else {
        // Usar Resend para producción
        if (!process.env.RESEND_API_KEY) {
          console.log('📧 [Email no enviado - RESEND_API_KEY no configurada]');
          console.log(`   Para: ${to}`);
          console.log(`   Asunto: ${subject}`);
          console.log(`   Contenido: ${text || 'HTML'}`);
          return { success: true, message: 'Email logged (RESEND_API_KEY not configured)' };
        }

        const resend = this.initializeResend();
        if (!resend) {
          throw new Error('Resend no inicializado');
        }

        const fromEmail = from || process.env.RESEND_FROM_EMAIL || 'noreply@mises-wallet.com';

        const { data, error } = await resend.emails.send({
          from: fromEmail,
          to: [to],
          subject,
          html,
          text: text || html.replace(/<[^>]*>/g, '') // Fallback a texto plano
        });

        if (error) {
          throw error;
        }

        console.log('✅ Email enviado via Resend:', data?.id);
        return { success: true, messageId: data?.id };
      }
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      throw error;
    }
  }

  static generateWithdrawalReceipt({ userName, amount, tokenSymbol, txHash, date }) {
    const formattedDate = new Date(date).toLocaleString('es-GT', {
      timeZone: 'America/Guatemala',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 10px;
      background-color: #f4f4f4;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #ef4444;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #ef4444;
      margin: 0 0 10px 0;
      font-size: 24px;
    }
    .header p {
      margin: 0;
      font-size: 16px;
      color: #666;
    }
    .receipt-info {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e0e0e0;
      flex-wrap: wrap;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: bold;
      color: #666;
      font-size: 14px;
      margin-right: 10px;
    }
    .info-value {
      color: #333;
      font-size: 14px;
      text-align: right;
      flex: 1;
      min-width: 120px;
    }
    .amount {
      font-size: 20px;
      font-weight: bold;
      color: #ef4444;
    }
    .footer {
      margin-top: 25px;
      padding-top: 15px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 11px;
    }
    .hash {
      font-family: monospace;
      font-size: 11px;
      word-break: break-all;
      color: #666;
    }
    p {
      font-size: 14px;
      margin: 12px 0;
    }
    @media only screen and (max-width: 600px) {
      body {
        padding: 5px;
      }
      .container {
        padding: 15px;
        border-radius: 4px;
      }
      .header h1 {
        font-size: 20px;
      }
      .header p {
        font-size: 14px;
      }
      .receipt-info {
        padding: 12px;
      }
      .info-row {
        flex-direction: column;
        padding: 8px 0;
      }
      .info-label {
        font-size: 13px;
        margin-bottom: 4px;
        margin-right: 0;
      }
      .info-value {
        font-size: 13px;
        text-align: left;
        min-width: auto;
      }
      .amount {
        font-size: 18px;
      }
      .hash {
        font-size: 10px;
      }
      p {
        font-size: 13px;
      }
      .footer {
        font-size: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Mises Wallet</h1>
      <p>Recibo Digital de Retiro</p>
    </div>
    
    <p>Estimado/a <strong>${userName}</strong>,</p>
    
    <p>Su solicitud de retiro ha sido <strong style="color: #10b981;">APROBADA</strong> y procesada exitosamente.</p>
    
    <div class="receipt-info">
      <div class="info-row">
        <span class="info-label">Monto retirado:</span>
        <span class="info-value amount">${parseFloat(amount).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${tokenSymbol}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Fecha y hora:</span>
        <span class="info-value">${formattedDate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Hash de transacción:</span>
        <span class="info-value hash">${txHash || 'N/A'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Estado:</span>
        <span class="info-value" style="color: #10b981; font-weight: bold;">COMPLETADO</span>
      </div>
    </div>
    
    <p>Este es un recibo digital válido. Por favor, conserve este correo para sus registros.</p>
    
    <div class="footer">
      <p>Este es un correo automático, por favor no responda.</p>
      <p>Mises Wallet - Sistema de Gestión de HayekCoin</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  static generateWithdrawalRejection({ userName, amount, tokenSymbol, notes, date }) {
    const formattedDate = new Date(date).toLocaleString('es-GT', {
      timeZone: 'America/Guatemala',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 10px;
      background-color: #f4f4f4;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #ef4444;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #ef4444;
      margin: 0 0 10px 0;
      font-size: 24px;
    }
    .header p {
      margin: 0;
      font-size: 16px;
      color: #666;
    }
    .alert {
      background-color: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .alert p {
      margin: 8px 0;
      font-size: 14px;
    }
    .footer {
      margin-top: 25px;
      padding-top: 15px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 11px;
    }
    p {
      font-size: 14px;
      margin: 12px 0;
    }
    @media only screen and (max-width: 600px) {
      body {
        padding: 5px;
      }
      .container {
        padding: 15px;
        border-radius: 4px;
      }
      .header h1 {
        font-size: 20px;
      }
      .header p {
        font-size: 14px;
      }
      .alert {
        padding: 12px;
      }
      .alert p {
        font-size: 13px;
      }
      p {
        font-size: 13px;
      }
      .footer {
        font-size: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Mises Wallet</h1>
      <p>Notificación de Solicitud de Retiro</p>
    </div>
    
    <p>Estimado/a <strong>${userName}</strong>,</p>
    
    <p>Lamentamos informarle que su solicitud de retiro ha sido <strong style="color: #ef4444;">RECHAZADA</strong>.</p>
    
    <div class="alert">
      <p><strong>Detalles de la solicitud:</strong></p>
      <p>Monto solicitado: <strong>${parseFloat(amount).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${tokenSymbol}</strong></p>
      <p>Fecha de solicitud: ${formattedDate}</p>
      ${notes ? `<p><strong>Motivo del rechazo:</strong><br>${notes}</p>` : ''}
    </div>
    
    <p>Si tiene alguna pregunta o necesita más información, por favor contacte al administrador del sistema.</p>
    
    <div class="footer">
      <p>Este es un correo automático, por favor no responda.</p>
      <p>Mises Wallet - Sistema de Gestión de HayekCoin</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  static generateSettlementReceipt({ userName, businessName, eventName, amount, tokenSymbol, txHash, method, date }) {
    const formattedDate = new Date(date).toLocaleString('es-GT', {
      timeZone: 'America/Guatemala',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 10px;
      background-color: #f4f4f4;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #ef4444;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #ef4444;
      margin: 0 0 10px 0;
      font-size: 24px;
    }
    .header p {
      margin: 0;
      font-size: 16px;
      color: #666;
    }
    .receipt-info {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e0e0e0;
      flex-wrap: wrap;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: bold;
      color: #666;
      font-size: 14px;
      margin-right: 10px;
    }
    .info-value {
      color: #333;
      font-size: 14px;
      text-align: right;
      flex: 1;
      min-width: 120px;
    }
    .amount {
      font-size: 20px;
      font-weight: bold;
      color: #ef4444;
    }
    .footer {
      margin-top: 25px;
      padding-top: 15px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 11px;
    }
    .hash {
      font-family: monospace;
      font-size: 11px;
      word-break: break-all;
      color: #666;
    }
    p {
      font-size: 14px;
      margin: 12px 0;
    }
    @media only screen and (max-width: 600px) {
      body {
        padding: 5px;
      }
      .container {
        padding: 15px;
        border-radius: 4px;
      }
      .header h1 {
        font-size: 20px;
      }
      .header p {
        font-size: 14px;
      }
      .receipt-info {
        padding: 12px;
      }
      .info-row {
        flex-direction: column;
        padding: 8px 0;
      }
      .info-label {
        font-size: 13px;
        margin-bottom: 4px;
        margin-right: 0;
      }
      .info-value {
        font-size: 13px;
        text-align: left;
        min-width: auto;
      }
      .amount {
        font-size: 18px;
      }
      .hash {
        font-size: 10px;
      }
      p {
        font-size: 13px;
      }
      .footer {
        font-size: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Mises Wallet</h1>
      <p>Recibo Digital de Liquidación</p>
    </div>
    
    <p>Estimado/a <strong>${userName}</strong>,</p>
    
    <p>La solicitud de liquidación de su equipo ha sido <strong style="color: #10b981;">APROBADA</strong> y procesada exitosamente.</p>
    
    <div class="receipt-info">
      <div class="info-row">
        <span class="info-label">Equipo:</span>
        <span class="info-value">${businessName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Evento:</span>
        <span class="info-value">${eventName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Monto liquidado:</span>
        <span class="info-value amount">${parseFloat(amount).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${tokenSymbol}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Método de pago:</span>
        <span class="info-value">${method || 'Efectivo'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Fecha y hora:</span>
        <span class="info-value">${formattedDate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Hash de transacción:</span>
        <span class="info-value hash">${txHash || 'N/A'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Estado:</span>
        <span class="info-value" style="color: #10b981; font-weight: bold;">PAGADO</span>
      </div>
    </div>
    
    <p>Este es un recibo digital válido. Por favor, conserve este correo para sus registros.</p>
    
    <div class="footer">
      <p>Este es un correo automático, por favor no responda.</p>
      <p>Mises Wallet - Sistema de Gestión de HayekCoin</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  static generateSettlementRejection({ userName, businessName, eventName, amount, tokenSymbol, notes, date }) {
    const formattedDate = new Date(date).toLocaleString('es-GT', {
      timeZone: 'America/Guatemala',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 10px;
      background-color: #f4f4f4;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #ef4444;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #ef4444;
      margin: 0 0 10px 0;
      font-size: 24px;
    }
    .header p {
      margin: 0;
      font-size: 16px;
      color: #666;
    }
    .alert {
      background-color: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .alert p {
      margin: 8px 0;
      font-size: 14px;
    }
    .footer {
      margin-top: 25px;
      padding-top: 15px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 11px;
    }
    p {
      font-size: 14px;
      margin: 12px 0;
    }
    @media only screen and (max-width: 600px) {
      body {
        padding: 5px;
      }
      .container {
        padding: 15px;
        border-radius: 4px;
      }
      .header h1 {
        font-size: 20px;
      }
      .header p {
        font-size: 14px;
      }
      .alert {
        padding: 12px;
      }
      .alert p {
        font-size: 13px;
      }
      p {
        font-size: 13px;
      }
      .footer {
        font-size: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Mises Wallet</h1>
      <p>Notificación de Solicitud de Liquidación</p>
    </div>
    
    <p>Estimado/a <strong>${userName}</strong>,</p>
    
    <p>Lamentamos informarle que la solicitud de liquidación de su equipo ha sido <strong style="color: #ef4444;">RECHAZADA</strong>.</p>
    
    <div class="alert">
      <p><strong>Detalles de la solicitud:</strong></p>
      <p>Equipo: <strong>${businessName}</strong></p>
      <p>Evento: <strong>${eventName}</strong></p>
      <p>Monto solicitado: <strong>${parseFloat(amount).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${tokenSymbol}</strong></p>
      <p>Fecha de solicitud: ${formattedDate}</p>
      ${notes ? `<p><strong>Motivo del rechazo:</strong><br>${notes}</p>` : ''}
    </div>
    
    <p>Si tiene alguna pregunta o necesita más información, por favor contacte al administrador del sistema.</p>
    
    <div class="footer">
      <p>Este es un correo automático, por favor no responda.</p>
      <p>Mises Wallet - Sistema de Gestión de HayekCoin</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  static generateWelcomeEmail({ userName, email, date }) {
    const formattedDate = new Date(date).toLocaleString('es-GT', {
      timeZone: 'America/Guatemala',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 10px;
      background-color: #f4f4f4;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #ef4444;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #ef4444;
      margin: 0 0 10px 0;
      font-size: 24px;
    }
    .header p {
      margin: 0;
      font-size: 16px;
      color: #666;
    }
    .welcome-box {
      background-color: #f0f9ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .welcome-box p {
      margin: 8px 0;
      font-size: 14px;
    }
    .footer {
      margin-top: 25px;
      padding-top: 15px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 11px;
    }
    p {
      font-size: 14px;
      margin: 12px 0;
    }
    ul {
      font-size: 14px;
      margin: 12px 0;
      padding-left: 20px;
    }
    li {
      margin: 6px 0;
    }
    @media only screen and (max-width: 600px) {
      body {
        padding: 5px;
      }
      .container {
        padding: 15px;
        border-radius: 4px;
      }
      .header h1 {
        font-size: 20px;
      }
      .header p {
        font-size: 14px;
      }
      .welcome-box {
        padding: 12px;
      }
      .welcome-box p {
        font-size: 13px;
      }
      p {
        font-size: 13px;
      }
      ul {
        font-size: 13px;
      }
      .footer {
        font-size: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Mises Wallet</h1>
      <p>¡Bienvenido/a!</p>
    </div>
    
    <p>Estimado/a <strong>${userName}</strong>,</p>
    
    <p>¡Bienvenido/a a <strong>Mises Wallet</strong>! Tu cuenta ha sido creada exitosamente.</p>
    
    <div class="welcome-box">
      <p><strong>Tu cuenta está lista para usar:</strong></p>
      <p>Email: <strong>${email}</strong></p>
      <p>Fecha de registro: ${formattedDate}</p>
    </div>
    
    <p>Con Mises Wallet podrás:</p>
    <ul>
      <li>Gestionar tus HayekCoins (HC)</li>
      <li>Realizar pagos a equipos y comercios</li>
      <li>Recargar tu wallet fácilmente</li>
      <li>Ver tu historial de transacciones</li>
    </ul>
    
    <p>¡Esperamos que disfrutes usando nuestra plataforma!</p>
    
    <div class="footer">
      <p>Este es un correo automático, por favor no responda.</p>
      <p>Mises Wallet - Sistema de Gestión de HayekCoin</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  static generateRechargeReceipt({ userName, amount, tokenSymbol, usdAmount, txHash, date }) {
    const formattedDate = new Date(date).toLocaleString('es-GT', {
      timeZone: 'America/Guatemala',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 10px;
      background-color: #f4f4f4;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #ef4444;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #ef4444;
      margin: 0 0 10px 0;
      font-size: 24px;
    }
    .header p {
      margin: 0;
      font-size: 16px;
      color: #666;
    }
    .receipt-info {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e0e0e0;
      flex-wrap: wrap;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: bold;
      color: #666;
      font-size: 14px;
      margin-right: 10px;
    }
    .info-value {
      color: #333;
      font-size: 14px;
      text-align: right;
      flex: 1;
      min-width: 120px;
    }
    .amount {
      font-size: 20px;
      font-weight: bold;
      color: #10b981;
    }
    .footer {
      margin-top: 25px;
      padding-top: 15px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 11px;
    }
    .hash {
      font-family: monospace;
      font-size: 11px;
      word-break: break-all;
      color: #666;
    }
    p {
      font-size: 14px;
      margin: 12px 0;
    }
    @media only screen and (max-width: 600px) {
      body {
        padding: 5px;
      }
      .container {
        padding: 15px;
        border-radius: 4px;
      }
      .header h1 {
        font-size: 20px;
      }
      .header p {
        font-size: 14px;
      }
      .receipt-info {
        padding: 12px;
      }
      .info-row {
        flex-direction: column;
        padding: 8px 0;
      }
      .info-label {
        font-size: 13px;
        margin-bottom: 4px;
        margin-right: 0;
      }
      .info-value {
        font-size: 13px;
        text-align: left;
        min-width: auto;
      }
      .amount {
        font-size: 18px;
      }
      .hash {
        font-size: 10px;
      }
      p {
        font-size: 13px;
      }
      .footer {
        font-size: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Mises Wallet</h1>
      <p>Recibo Digital de Recarga</p>
    </div>
    
    <p>Estimado/a <strong>${userName}</strong>,</p>
    
    <p>Su recarga de HayekCoins ha sido <strong style="color: #10b981;">COMPLETADA</strong> exitosamente.</p>
    
    <div class="receipt-info">
      <div class="info-row">
        <span class="info-label">Monto recargado:</span>
        <span class="info-value amount">${parseFloat(amount).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${tokenSymbol}</span>
      </div>
      ${usdAmount ? `
      <div class="info-row">
        <span class="info-label">Equivalente en GTQ:</span>
        <span class="info-value">Q${parseFloat(usdAmount).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
      ` : ''}
      <div class="info-row">
        <span class="info-label">Fecha y hora:</span>
        <span class="info-value">${formattedDate}</span>
      </div>
      ${txHash ? `
      <div class="info-row">
        <span class="info-label">Hash de transacción:</span>
        <span class="info-value hash">${txHash}</span>
      </div>
      ` : ''}
      <div class="info-row">
        <span class="info-label">Estado:</span>
        <span class="info-value" style="color: #10b981; font-weight: bold;">COMPLETADA</span>
      </div>
    </div>
    
    <p>Este es un recibo digital válido. Por favor, conserve este correo para sus registros.</p>
    
    <div class="footer">
      <p>Este es un correo automático, por favor no responda.</p>
      <p>Mises Wallet - Sistema de Gestión de HayekCoin</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  static generatePaymentReceipt({ userName, amount, tokenSymbol, merchantName, eventName, txHash, date }) {
    const formattedDate = new Date(date).toLocaleString('es-GT', {
      timeZone: 'America/Guatemala',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 10px;
      background-color: #f4f4f4;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #ef4444;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #ef4444;
      margin: 0 0 10px 0;
      font-size: 24px;
    }
    .header p {
      margin: 0;
      font-size: 16px;
      color: #666;
    }
    .receipt-info {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e0e0e0;
      flex-wrap: wrap;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: bold;
      color: #666;
      font-size: 14px;
      margin-right: 10px;
    }
    .info-value {
      color: #333;
      font-size: 14px;
      text-align: right;
      flex: 1;
      min-width: 120px;
    }
    .amount {
      font-size: 20px;
      font-weight: bold;
      color: #ef4444;
    }
    .footer {
      margin-top: 25px;
      padding-top: 15px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 11px;
    }
    .hash {
      font-family: monospace;
      font-size: 11px;
      word-break: break-all;
      color: #666;
    }
    p {
      font-size: 14px;
      margin: 12px 0;
    }
    @media only screen and (max-width: 600px) {
      body {
        padding: 5px;
      }
      .container {
        padding: 15px;
        border-radius: 4px;
      }
      .header h1 {
        font-size: 20px;
      }
      .header p {
        font-size: 14px;
      }
      .receipt-info {
        padding: 12px;
      }
      .info-row {
        flex-direction: column;
        padding: 8px 0;
      }
      .info-label {
        font-size: 13px;
        margin-bottom: 4px;
        margin-right: 0;
      }
      .info-value {
        font-size: 13px;
        text-align: left;
        min-width: auto;
      }
      .amount {
        font-size: 18px;
      }
      .hash {
        font-size: 10px;
      }
      p {
        font-size: 13px;
      }
      .footer {
        font-size: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Mises Wallet</h1>
      <p>Recibo Digital de Pago</p>
    </div>
    
    <p>Estimado/a <strong>${userName}</strong>,</p>
    
    <p>Su pago ha sido <strong style="color: #10b981;">PROCESADO</strong> exitosamente.</p>
    
    <div class="receipt-info">
      <div class="info-row">
        <span class="info-label">Monto pagado:</span>
        <span class="info-value amount">${parseFloat(amount).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${tokenSymbol}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Comercio/Equipo:</span>
        <span class="info-value">${merchantName}</span>
      </div>
      ${eventName ? `
      <div class="info-row">
        <span class="info-label">Evento:</span>
        <span class="info-value">${eventName}</span>
      </div>
      ` : ''}
      <div class="info-row">
        <span class="info-label">Fecha y hora:</span>
        <span class="info-value">${formattedDate}</span>
      </div>
      ${txHash ? `
      <div class="info-row">
        <span class="info-label">Hash de transacción:</span>
        <span class="info-value hash">${txHash}</span>
      </div>
      ` : ''}
      <div class="info-row">
        <span class="info-label">Estado:</span>
        <span class="info-value" style="color: #10b981; font-weight: bold;">COMPLETADO</span>
      </div>
    </div>
    
    <p>Este es un recibo digital válido. Por favor, conserve este correo para sus registros.</p>
    
    <div class="footer">
      <p>Este es un correo automático, por favor no responda.</p>
      <p>Mises Wallet - Sistema de Gestión de HayekCoin</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  static generateReceiveNotification({ userName, amount, tokenSymbol, fromName, txHash, date }) {
    const formattedDate = new Date(date).toLocaleString('es-GT', {
      timeZone: 'America/Guatemala',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 10px;
      background-color: #f4f4f4;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #ef4444;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #ef4444;
      margin: 0 0 10px 0;
      font-size: 24px;
    }
    .header p {
      margin: 0;
      font-size: 16px;
      color: #666;
    }
    .notification-box {
      background-color: #f0f9ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .notification-box p {
      margin: 8px 0;
      font-size: 14px;
    }
    .amount {
      font-size: 20px;
      font-weight: bold;
      color: #10b981;
      display: block;
      margin-top: 5px;
    }
    .footer {
      margin-top: 25px;
      padding-top: 15px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 11px;
    }
    .hash {
      font-family: monospace;
      font-size: 11px;
      word-break: break-all;
      color: #666;
      display: block;
      margin-top: 5px;
    }
    p {
      font-size: 14px;
      margin: 12px 0;
    }
    @media only screen and (max-width: 600px) {
      body {
        padding: 5px;
      }
      .container {
        padding: 15px;
        border-radius: 4px;
      }
      .header h1 {
        font-size: 20px;
      }
      .header p {
        font-size: 14px;
      }
      .notification-box {
        padding: 12px;
      }
      .notification-box p {
        font-size: 13px;
      }
      .amount {
        font-size: 18px;
      }
      .hash {
        font-size: 10px;
      }
      p {
        font-size: 13px;
      }
      .footer {
        font-size: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Mises Wallet</h1>
      <p>Notificación de Recepción</p>
    </div>
    
    <p>Estimado/a <strong>${userName}</strong>,</p>
    
    <p>Has recibido una transferencia de HayekCoins en tu wallet.</p>
    
    <div class="notification-box">
      <p><strong>Detalles de la transferencia:</strong></p>
      <p>Monto recibido: <span class="amount">${parseFloat(amount).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${tokenSymbol}</span></p>
      ${fromName ? `<p>De: <strong>${fromName}</strong></p>` : ''}
      <p>Fecha y hora: ${formattedDate}</p>
      ${txHash ? `<p>Hash de transacción: <span class="hash">${txHash}</span></p>` : ''}
    </div>
    
    <p>Tu balance ha sido actualizado automáticamente.</p>
    
    <div class="footer">
      <p>Este es un correo automático, por favor no responda.</p>
      <p>Mises Wallet - Sistema de Gestión de HayekCoin</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  static generatePasswordResetEmail({ userName, resetLink, expiresIn }) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 10px;
      background-color: #f4f4f4;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #ef4444;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #ef4444;
      margin: 0 0 10px 0;
      font-size: 24px;
    }
    .header p {
      margin: 0;
      font-size: 16px;
      color: #666;
    }
    .reset-box {
      background-color: #f0f9ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .reset-box p {
      margin: 8px 0;
      font-size: 14px;
    }
    .reset-button {
      display: inline-block;
      background-color: #ef4444;
      color: #ffffff;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 15px 0;
      text-align: center;
    }
    .reset-button:hover {
      background-color: #dc2626;
    }
    .warning-box {
      background-color: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 12px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .warning-box p {
      margin: 6px 0;
      font-size: 13px;
      color: #991b1b;
    }
    .footer {
      margin-top: 25px;
      padding-top: 15px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 11px;
    }
    p {
      font-size: 14px;
      margin: 12px 0;
    }
    @media only screen and (max-width: 600px) {
      body {
        padding: 5px;
      }
      .container {
        padding: 15px;
        border-radius: 4px;
      }
      .header h1 {
        font-size: 20px;
      }
      .header p {
        font-size: 14px;
      }
      .reset-box {
        padding: 12px;
      }
      .reset-box p {
        font-size: 13px;
      }
      .reset-button {
        padding: 10px 20px;
        font-size: 14px;
        display: block;
        text-align: center;
      }
      .warning-box {
        padding: 10px;
      }
      .warning-box p {
        font-size: 12px;
      }
      p {
        font-size: 13px;
      }
      .footer {
        font-size: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Mises Wallet</h1>
      <p>Recuperación de Contraseña</p>
    </div>
    
    <p>Estimado/a <strong>${userName}</strong>,</p>
    
    <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Mises Wallet.</p>
    
    <div class="reset-box">
      <p><strong>Para restablecer tu contraseña, haz clic en el siguiente botón:</strong></p>
      <div style="text-align: center;">
        <a href="${resetLink}" class="reset-button">Restablecer Contraseña</a>
      </div>
      <p style="font-size: 12px; color: #666; margin-top: 10px;">O copia y pega este enlace en tu navegador:</p>
      <p style="font-size: 11px; color: #666; word-break: break-all; font-family: monospace;">${resetLink}</p>
    </div>
    
    <div class="warning-box">
      <p><strong>⚠️ Importante:</strong></p>
      <p>Este enlace expirará en ${expiresIn}.</p>
      <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
      <p>Por seguridad, nunca compartas este enlace con nadie.</p>
    </div>
    
    <div class="footer">
      <p>Este es un correo automático, por favor no responda.</p>
      <p>Mises Wallet - Sistema de Gestión de HayekCoin</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  static generateSendNotification({ userName, amount, tokenSymbol, toName, txHash, date }) {
    const formattedDate = new Date(date).toLocaleString('es-GT', {
      timeZone: 'America/Guatemala',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 10px;
      background-color: #f4f4f4;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #ef4444;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #ef4444;
      margin: 0 0 10px 0;
      font-size: 24px;
    }
    .header p {
      margin: 0;
      font-size: 16px;
      color: #666;
    }
    .notification-box {
      background-color: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .notification-box p {
      margin: 8px 0;
      font-size: 14px;
    }
    .amount {
      font-size: 20px;
      font-weight: bold;
      color: #ef4444;
      display: block;
      margin-top: 5px;
    }
    .footer {
      margin-top: 25px;
      padding-top: 15px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 11px;
    }
    .hash {
      font-family: monospace;
      font-size: 11px;
      word-break: break-all;
      color: #666;
      display: block;
      margin-top: 5px;
    }
    p {
      font-size: 14px;
      margin: 12px 0;
    }
    @media only screen and (max-width: 600px) {
      body {
        padding: 5px;
      }
      .container {
        padding: 15px;
        border-radius: 4px;
      }
      .header h1 {
        font-size: 20px;
      }
      .header p {
        font-size: 14px;
      }
      .notification-box {
        padding: 12px;
      }
      .notification-box p {
        font-size: 13px;
      }
      .amount {
        font-size: 18px;
      }
      .hash {
        font-size: 10px;
      }
      p {
        font-size: 13px;
      }
      .footer {
        font-size: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Mises Wallet</h1>
      <p>Notificación de Envío</p>
    </div>
    
    <p>Estimado/a <strong>${userName}</strong>,</p>
    
    <p>Has enviado una transferencia de HayekCoins desde tu wallet.</p>
    
    <div class="notification-box">
      <p><strong>Detalles de la transferencia:</strong></p>
      <p>Monto enviado: <span class="amount">${parseFloat(amount).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${tokenSymbol}</span></p>
      ${toName ? `<p>A: <strong>${toName}</strong></p>` : ''}
      <p>Fecha y hora: ${formattedDate}</p>
      ${txHash ? `<p>Hash de transacción: <span class="hash">${txHash}</span></p>` : ''}
    </div>
    
    <p>Tu balance ha sido actualizado automáticamente.</p>
    
    <div class="footer">
      <p>Este es un correo automático, por favor no responda.</p>
      <p>Mises Wallet - Sistema de Gestión de HayekCoin</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}

export default EmailService;
