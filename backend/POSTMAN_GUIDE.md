# Guia Postman - API Cami3D

## Configuração

1. Importe `postman-collection.json` no Postman
2. Configure a variável da coleção `base_url` para `http://localhost:3001`
3. Inicie o servidor backend: `npm start`

## Fluxo de Teste

1. **Health Check** - Verificar se o servidor está rodando
2. **Registrar/Login** - Obter token JWT (salvo automaticamente)
3. **Upload de Imagem** - Testar envio de arquivo (ID da imagem salvo automaticamente)
4. **Salvar Design** - Criar design de camiseta (ID do design salvo automaticamente)
5. **Listar Designs** - Ver designs do usuário

## Problemas Comuns

- **401 Unauthorized**: Faça login novamente para obter novo token
- **400 Bad Request**: Verifique campos obrigatórios e formatos
- **Connection Error**: Certifique-se que o servidor está rodando na porta 3001

## Exemplos de Payload

### Registrar Usuário
```json
{
  "name": "Usuário Teste",
  "email": "teste@exemplo.com", 
  "password": "123456"
}
```

### Salvar Design
```json
{
  "color": "#FF0000",
  "style": "crew-neck",
  "text": "Meu Design"
}
```
