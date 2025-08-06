# 📋 Guia de Uso da Coleção Postman - Cami3D API

## 🚀 Como Importar e Configurar

### 1. Importar a Coleção
1. Abra o Postman
2. Clique em **Import** (ou Ctrl+O)
3. Selecione o arquivo `postman-collection.json`
4. A coleção "Cami3D Backend API" será importada

### 2. Configurar Variáveis
Na aba **Variables** da coleção, configure:
- `base_url`: `http://localhost:3001`
- `jwt_token`: (será preenchido automaticamente após login)
- `user_id`: (será preenchido automaticamente após login)
- `design_id`: (será preenchido automaticamente ao criar design)
- `image_id`: (será preenchido automaticamente ao fazer upload)

## 🔄 Fluxo de Teste Recomendado

### Etapa 1: Verificar Conectividade
1. **🏥 Health Check**
   - Execute primeiro para verificar se o servidor está rodando
   - Deve retornar status 200 com informações da API

### Etapa 2: Autenticação
2. **🔐 Registrar Usuário**
   - Cria um novo usuário no sistema
   - O token JWT é salvo automaticamente nas variáveis
   - **OU**
3. **🔐 Login Usuário**
   - Faz login com um usuário existente
   - O token JWT é salvo automaticamente nas variáveis

### Etapa 3: Perfil do Usuário
4. **👤 Obter Perfil**
   - Verifica se a autenticação está funcionando
   - Mostra dados do usuário logado

### Etapa 4: Upload de Arquivos
5. **📤 Upload de Imagem**
   - Selecione uma imagem PNG, JPG ou SVG (máx 5MB)
   - O ID da imagem é salvo automaticamente
6. **📤 Listar Imagens do Usuário**
   - Mostra todas as imagens enviadas pelo usuário

### Etapa 5: Designs de Camisetas
7. **👕 Salvar Design**
   - Cria um novo design de camiseta
   - O ID do design é salvo automaticamente
8. **👕 Meus Designs**
   - Lista todos os designs do usuário
9. **👕 Obter Design por ID**
   - Mostra detalhes de um design específico
10. **👕 Galeria Pública**
    - Lista designs públicos disponíveis

## 🧪 Testes Avançados

### Scripts Automáticos
A coleção inclui scripts que:
- **Salvam automaticamente** tokens JWT, IDs de usuário, design e imagem
- **Executam testes** de validação das respostas
- **Verificam status codes** esperados

### Casos de Teste Especiais
- **Design com Logo Personalizado**: Testa upload e posicionamento
- **Validação de Dados**: Testa comportamento com dados inválidos
- **Teste sem Autenticação**: Verifica proteção de rotas

## 📊 Respostas Esperadas

### ✅ Sucessos
- **200**: Operação realizada com sucesso
- **201**: Recurso criado com sucesso

### ❌ Erros Comuns
- **400**: Dados inválidos ou mal formatados
- **401**: Token JWT ausente ou inválido
- **403**: Acesso negado (sem permissão)
- **404**: Recurso não encontrado
- **429**: Muitas requisições (rate limit)

## 🔧 Troubleshooting

### Problema: "Connection refused"
**Solução**: Verifique se o servidor backend está rodando:
```bash
cd backend
npm start
```

### Problema: "401 Unauthorized"
**Soluções**:
1. Execute o login novamente para obter novo token
2. Verifique se a variável `jwt_token` está preenchida
3. Confirme que o token não expirou

### Problema: "400 Validation Error"
**Soluções**:
1. Verifique se todos os campos obrigatórios estão preenchidos
2. Confirme se os formatos estão corretos (ex: cor em hex: #ff0000)
3. Verifique se os valores estão dentro dos limites permitidos

### Problema: Upload falha
**Soluções**:
1. Confirme que o arquivo é PNG, JPG ou SVG
2. Verifique se o arquivo não excede 5MB
3. Certifique-se de estar autenticado

## 🔄 Workflows Automáticos

### Teste Completo de Registro → Design
1. Health Check
2. Registrar Usuário (token salvo automaticamente)
3. Obter Perfil
4. Upload de Imagem (ID salvo automaticamente)
5. Salvar Design (ID salvo automaticamente)
6. Listar Meus Designs

### Teste de Atualização de Design
1. Login (se necessário)
2. Salvar Design
3. Atualizar Design (usando design_id da variável)
4. Verificar Mudanças

## 📝 Exemplos de Payloads

### Registro de Usuário
```json
{
    "name": "Fulano de Tal",
    "username": "fulano",
    "email": "fulano@mail.com",
    "password": "123456"
}
```

### Design Básico
```json
{
    "color": "#ff0000",
    "style": "crew-neck",
    "text": "Camiseta do Fulano",
    "textColor": "#ffffff",
    "textSize": 0.1
}
```

### Design Avançado com Logo
```json
{
    "name": "Design Premium do Fulano",
    "color": "#0066cc",
    "style": "v-neck",
    "text": "Fulano Store",
    "textColor": "#ffffff",
    "textSize": 0.12,
    "textPosition": {"x": 0, "y": -0.2},
    "logo": "/uploads/logo-fulano.png",
    "logoPosition": {"x": 0, "y": 0.1},
    "logoScale": 0.8,
    "modelType": "procedural",
    "renderQuality": "high",
    "isPublic": true
}
```

## 📈 Monitoramento

### Logs do Console
- Os scripts da coleção exibem logs úteis no console do Postman
- IDs importantes são logados quando salvos nas variáveis
- Erros são capturados e exibidos

### Variáveis de Ambiente
- Monitore as variáveis da coleção para ver IDs salvos
- Use essas variáveis em outros endpoints conforme necessário

## 🎯 Próximos Passos

Após dominar a coleção Postman:
1. **Integre com o frontend** React usando fetch/axios
2. **Implemente testes automatizados** usando Newman (CLI do Postman)
3. **Configure CI/CD** para executar testes da API automaticamente
4. **Expanda a coleção** com novos endpoints conforme a API cresce

---

📧 **Dúvidas?** Consulte a documentação da API no README.md ou verifique os logs do servidor backend.
