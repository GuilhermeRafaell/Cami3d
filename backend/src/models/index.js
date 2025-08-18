// Arquivo central dos modelos do banco de dados
// Importa e exporta todos os schemas do MongoDB

// Importa os modelos
const User = require('./User');       // Usuários do sistema
const Tshirt = require('./Tshirt');   // Designs de camisetas
const Upload = require('./Upload');   // Arquivos enviados

// Exporta todos os modelos
module.exports = {
  User,
  Tshirt,
  Upload
};
