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

    // Criar diretório de dados se não existir
    const dataDir = path.join(__dirname, '../../data');
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
      console.log('📁 Diretório data/ criado');
    }

    // Verificar e criar arquivos JSON se não existirem
    const dataFiles = [
      { name: 'users.json', content: [] },
      { name: 'tshirts.json', content: [] },
      { name: 'uploads.json', content: [] }
    ];

    for (const file of dataFiles) {
      const filePath = path.join(dataDir, file.name);
      try {
        await fs.access(filePath);
      } catch {
        await fs.writeFile(filePath, JSON.stringify(file.content, null, 2));
        console.log(`📄 Arquivo ${file.name} criado`);
      }
    }

    console.log('✅ Inicialização do sistema de armazenamento concluída');
  } catch (error) {
    console.error('❌ Erro na inicialização do armazenamento:', error);
    throw error;
  }
};

module.exports = { initStorage };
