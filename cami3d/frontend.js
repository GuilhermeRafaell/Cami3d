import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

// Debug: Verificar se a pasta dist existe
console.log('Diretório atual:', __dirname);
console.log('Caminho para dist:', distPath);

if (fs.existsSync(distPath)) {
  console.log('✅ Pasta dist encontrada');
  const files = fs.readdirSync(distPath);
  console.log('Arquivos em dist:', files);
} else {
  console.log('❌ Pasta dist NÃO encontrada');
  console.log('Conteúdo do diretório atual:', fs.readdirSync(__dirname));
}

app.use(express.static(distPath));

app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
