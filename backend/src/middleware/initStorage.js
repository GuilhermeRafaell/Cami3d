const fs = require('fs').promises;
const path = require('path');

// Middleware para garantir que diretórios necessários existam
const initStorage = async () => {
  try {
    // Criar diretório de uploads se não existir
    const uploadsDir = path.join(__dirname, '../../uploads');
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
      console.log('📁 Diretório uploads/ criado');
    }

    console.log('✅ Inicialização do sistema de armazenamento concluída');
  } catch (error) {
    console.error('❌ Erro na inicialização do armazenamento:', error);
    throw error;
  }
};

module.exports = { initStorage };
