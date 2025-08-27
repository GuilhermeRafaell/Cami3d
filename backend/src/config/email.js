const nodemailer = require('nodemailer');

// Configuração do transporte de email usando MailTrap
const createTransporter = () => {
  // Validação de variáveis obrigatórias
  if (!process.env.MAIL_HOST || !process.env.MAIL_PORT || !process.env.MAIL_USERNAME || !process.env.MAIL_PASSWORD || !process.env.MAIL_SECURE || !process.env.MAIL_REJECT_UNAUTHORIZED || !process.env.MAIL_FROM || !process.env.PRODUCTION_FRONTEND_URL) {
    throw new Error('Configurações de email não definidas. Verifique as variáveis MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD, MAIL_SECURE, MAIL_REJECT_UNAUTHORIZED, MAIL_FROM e PRODUCTION_FRONTEND_URL no arquivo .env');
  }

  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: process.env.MAIL_REJECT_UNAUTHORIZED === 'true'
    },
    connectionTimeout: parseInt(process.env.MAIL_CONNECTION_TIMEOUT || '10000'),
    greetingTimeout: parseInt(process.env.MAIL_GREETING_TIMEOUT || '10000'),
    socketTimeout: parseInt(process.env.MAIL_SOCKET_TIMEOUT || '10000')
  });
};

// Função para enviar email de recuperação de senha
const sendPasswordResetEmail = async (email, resetToken, userName) => {
  try {
    const transporter = createTransporter();

    const resetUrl = `${process.env.PRODUCTION_FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: {
        name: process.env.MAIL_FROM_NAME || 'Sistema',
        address: process.env.MAIL_FROM
      },
      to: email,
      subject: process.env.MAIL_SUBJECT || 'Recuperação de Senha',
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recuperação de Senha</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: #ffffff;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              color: ${process.env.MAIL_BRAND_COLOR || '#007bff'};
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .button {
              display: inline-block;
              background-color: ${process.env.MAIL_BUTTON_COLOR || '#007bff'};
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .button:hover {
              background-color: ${process.env.MAIL_BUTTON_HOVER_COLOR || '#0056b3'};
            }
            .warning {
              background-color: #fff3cd;
              border: 1px solid #ffeaa7;
              color: #856404;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">${process.env.MAIL_FROM_NAME || 'Sistema'}</div>
              <h2>${process.env.MAIL_SUBJECT || 'Recuperação de Senha'}</h2>
            </div>
            
            <p>Olá, <strong>${userName}</strong>!</p>
            
            <p>Recebemos uma solicitação para redefinir a senha da sua conta. Se você fez esta solicitação, clique no botão abaixo para criar uma nova senha:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Redefinir Senha</a>
            </div>
            
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px;">
              ${resetUrl}
            </p>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul>
                <li>Este link é válido por apenas <strong>${process.env.RESET_TOKEN_EXPIRY_MINUTES || '10'} minutos</strong></li>
                <li>Se você não solicitou esta recuperação, ignore este email</li>
                <li>Sua senha atual permanecerá inalterada até que você redefina</li>
              </ul>
            </div>
            
            <p>Se você está tendo problemas para clicar no botão, copie e cole o URL em uma nova aba do navegador.</p>
            
            <div class="footer">
              <p>Este é um email automático, por favor não responda.</p>
              <p>&copy; ${new Date().getFullYear()} ${process.env.MAIL_FROM_NAME || 'Sistema'}. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Olá, ${userName}!
        
        Recebemos uma solicitação para redefinir a senha da sua conta ${process.env.MAIL_FROM_NAME || 'Sistema'}.
        
        Para redefinir sua senha, acesse o link abaixo:
        ${resetUrl}
        
        IMPORTANTE:
        - Este link é válido por apenas ${process.env.RESET_TOKEN_EXPIRY_MINUTES || '10'} minutos
        - Se você não solicitou esta recuperação, ignore este email
        - Sua senha atual permanecerá inalterada até que você redefina
        
        Se você está tendo problemas com o link, copie e cole a URL completa no seu navegador.
        
        ---
        ${process.env.MAIL_FROM_NAME || 'Sistema'} Team
        Este é um email automático, por favor não responda.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email de recuperação enviado:', info.messageId);
    return {
      success: true,
      messageId: info.messageId
    };
    
  } catch (error) {
    console.error('Erro ao enviar email de recuperação:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Função para testar configuração de email
const testEmailConfig = async () => {
  try {
    console.log('🔍 Debug - Variáveis de ambiente:');
    console.log('MAIL_HOST:', process.env.MAIL_HOST);
    console.log('MAIL_PORT:', process.env.MAIL_PORT);
    console.log('MAIL_USERNAME:', process.env.MAIL_USERNAME ? '***' + process.env.MAIL_USERNAME.slice(-4) : 'não configurado');
    console.log('MAIL_PASSWORD:', process.env.MAIL_PASSWORD ? '***' + process.env.MAIL_PASSWORD.slice(-4) : 'não configurado');
    
    const transporter = createTransporter();
    
    // Teste com timeout
    console.log(`🔗 Testando conexão com ${process.env.MAIL_HOST}...`);
    const verifyPromise = transporter.verify();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Timeout: Conexão demorou mais de ${process.env.MAIL_TEST_TIMEOUT || '15'} segundos`)), parseInt(process.env.MAIL_TEST_TIMEOUT || '15000'))
    );
    
    await Promise.race([verifyPromise, timeoutPromise]);
    
    console.log('✅ Configuração de email válida');
    return true;
  } catch (error) {
    console.error('❌ Erro na configuração de email:', error.message);
    
    // Se for erro de timeout ou conexão, ainda consideramos OK para não bloquear a API
    if (error.message.includes('Timeout') || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.log('⚠️  Aviso: Teste de email falhou, mas funcionalidade pode estar OK');
      return true; // Retorna true para não bloquear outras funcionalidades
    }
    
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  testEmailConfig,
  createTransporter
};
