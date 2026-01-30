# InstaSpy - Aplicação Web

Aplicação web profissional para visualização de perfis Instagram.

## 🚀 Deploy Railway

Este projeto está configurado para deploy automático no Railway.

### Variáveis de Ambiente

Nenhuma variável de ambiente é necessária para a versão básica.

## 📁 Estrutura

```
stalkea_clone/
├── index.html          # Página principal
├── pages/              # Páginas da aplicação
│   ├── cta.html       # Call-to-action
│   ├── checkout.html  # Checkout
│   ├── mbway-payment.html
│   ├── multibanco-payment.html
│   ├── direct.html    # Mensagens diretas
│   ├── feed.html      # Feed
│   └── chat-*.html    # Conversas
├── styles/            # Estilos CSS
├── scripts/           # JavaScript
└── assets/            # Imagens e recursos

```

## 🛠️ Desenvolvimento Local

```bash
cd stalkea_clone
python3 -m http.server 8000
```

Acesse: `http://localhost:8000`

## 🌐 Produção

O projeto usa servidor HTTP estático Python para servir os arquivos.

## 📝 Licença

Propriedade privada - Todos os direitos reservados
