# 🚀 API E-commerce Ultra-Complete & Flexible

Uma API de E-commerce robusta, modular e escalável, projetada para atender a modelos de negócios complexos (B2C, B2B, Assinaturas, Produtos Digitais). Inclui gestão avançada de estoque (Lotes), múltiplos gateways de pagamento (Mercado Pago, Asaas, Stripe), Analytics comportamental e RBAC granular.

---

## 📋 Índice

1.  [Visão Geral](#-visão-geral)
2.  [Tecnologias](#-tecnologias)
3.  [Funcionalidades Detalhadas](#-funcionalidades-detalhadas)
4.  [Arquitetura do Sistema](#-arquitetura-do-sistema)
5.  [Instalação e Configuração](#-instalação-e-configuração)
6.  [Configuração de Pagamentos](#-configuração-de-pagamentos)
7.  [Controle de Acesso (RBAC)](#-controle-de-acesso-rbac)
8.  [Analytics e Dashboard](#-analytics-e-dashboard)
9.  [Endpoints da API](#-endpoints-da-api)

---

## 🌟 Visão Geral

Este sistema não é apenas uma API de vendas, é um **ERP/E-commerce Engine** completo. Ele suporta:
*   **Produtos Físicos, Digitais, Serviços e Assinaturas**.
*   **Controle de Estoque Nível Bling**: Movimentações, Lotes, Validade, Custo.
*   **Pagamentos Transparentes e Checkout Pro**: Integração nativa com os maiores players.
*   **Inteligência de Dados**: Funis de conversão, CLV de clientes, Risco de Churn.

---

## 🛠 Tecnologias

*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: PostgreSQL
*   **ORM**: Sequelize
*   **Auth**: JWT (JSON Web Tokens)
*   **Pagamentos**: SDKs oficiais (Mercado Pago, Stripe) e Axios (Asaas)
*   **Uploads**: Multer (Local/S3 ready)
*   **Segurança**: Bcrypt, Helmet, CORS

---

## 💎 Funcionalidades Detalhadas

### 1. 🛒 Produtos Ultra-Flexíveis
*   **Tipos**: Físico, Digital (URL/Download), Assinatura (Recorrência), Serviço (Agendável).
*   **Variações**: Grade completa (Cor, Tamanho, Voltagem) com SKU, Preço e Estoque independentes.
*   **Customização**: Campos dinâmicos (`custom_options_schema`) para personalização pelo cliente (ex: Gravação de nome).
*   **Engajamento**: Sistema de Reviews (Avaliações) e Q&A (Perguntas e Respostas).
*   **SEO**: Slugs amigáveis, Meta Tags e Tags de busca.

### 2. 📦 Estoque Avançado (WMS Lite)
*   **Rastreabilidade**: Tabela `StockMovements` registra cada entrada/saída com usuário e motivo.
*   **Lotes (Batches)**: Controle de validade e custo por lote de entrada.
*   **Reserva**: Suporte a estoque reservado (em carrinhos ativos).
*   **Estoque Negativo**: Configuração por produto para permitir venda sem estoque (Backorder).

### 3. 💳 Sistema de Pagamentos Multi-Gateway
*   **Mercado Pago**:
    *   Checkout Transparente (Cartão/Pix).
    *   Checkout Pro (Redirect).
*   **Asaas**:
    *   Boleto, Pix e Cartão via API Transparente.
*   **Stripe**:
    *   Payment Intents (Transparente).
    *   Checkout Sessions (Hospedado).
*   **Configuração Dinâmica**: Chaves de API armazenadas no banco (`StoreConfig`), alteráveis via Admin sem reiniciar o servidor.

### 4. 🎫 Cupons e Promoções
*   **Regras Complexas**:
    *   Primeira Compra.
    *   Exclusivo para Assinantes.
    *   Lista de Emails Permitidos (VIPs).
    *   Acumulativo ou Único.
*   **Tipos**: Percentual, Valor Fixo, Frete Grátis.

### 5. 👥 Usuários e Segurança
*   **Perfis Completos**: CPF, Telefone, Múltiplos Endereços, Avatar.
*   **RBAC (Role-Based Access Control)**:
    *   Criação de Cargos (ex: "Gerente de Estoque").
    *   Permissões Granulares (ex: `product.create`, `stock.view`).
    *   Middleware `checkPermission` para proteção de rotas.

### 6. 📈 Analytics e Dashboard
*   **Dashboard**: Receita Diária, Carrinhos Abandonados, Alerta de Estoque Baixo.
*   **Relatórios**:
    *   **Vendas**: Curva de receita e ticket médio.
    *   **Produtos**: Taxa de conversão (Visualizações vs Compras).
    *   **Clientes**: LTV (Lifetime Value) e Risco de Churn (Inativos > 90 dias).
*   **Funil**: Monitoramento de Visitantes -> Carrinho -> Checkout -> Compra.

---

## 🏗 Arquitetura do Sistema

O projeto segue uma arquitetura modular baseada em **Features** (`src/features/`), onde cada módulo contém seu próprio:
*   `Service`: Lógica de negócio.
*   `Controller`: Tratamento de requisição/resposta.
*   `Routes`: Definição de endpoints.
*   `Provider`: Integrações externas (ex: Pagamentos).

Estrutura:
```
src/
├── config/         # Configuração de DB e Libs
├── features/       # Módulos (User, Product, Order, Payment, Analytics...)
├── middleware/     # Auth, Permissions, Error Handling
├── models/         # Definição de Tabelas (Sequelize)
├── routes/         # Roteador Central
└── app.js          # Entry Point
```

---

## 🚀 Instalação e Configuração

1.  **Pré-requisitos**: Node.js e PostgreSQL instalados.
2.  **Clone o repositório**:
    ```bash
    git clone <repo-url>
    cd api-ecommerce
    ```
3.  **Instale as dependências**:
    ```bash
    npm install
    ```
4.  **Configure o Ambiente**:
    Crie um arquivo `.env` na raiz:
    ```env
    DB_NAME=ecommerce_db
    DB_USER=postgres
    DB_PASS=senha
    DB_HOST=localhost
    JWT_SECRET=sua_chave_secreta_super_segura
    PORT=3000
    ```
5.  **Inicie o Servidor**:
    ```bash
    npm start
    ```
    *O Sequelize irá sincronizar as tabelas automaticamente na primeira execução.*

---

## ⚙️ Configuração de Pagamentos

As chaves de API não ficam hardcoded. Elas devem ser inseridas via Banco de Dados ou API de Admin na tabela `StoreConfigs`.

**Exemplo de Configuração (JSON no DB):**

*   **Mercado Pago**:
    *   Group: `payment`, Key: `mercadopago`
    *   Value: `{ "accessToken": "TEST-..." }`
*   **Asaas**:
    *   Group: `payment`, Key: `asaas`
    *   Value: `{ "apiKey": "$aact_...", "sandbox": true }`
*   **Stripe**:
    *   Group: `payment`, Key: `stripe`
    *   Value: `{ "secretKey": "sk_test_..." }`

---

## 🛡 Controle de Acesso (RBAC)

O sistema de permissões permite criar cargos personalizados.

**Exemplo de Fluxo:**
1.  Admin cria cargo "Editor":
    `POST /api/admin/roles` -> `{ "name": "Editor", "permissions": ["product.update", "product.view"] }`
2.  Admin atribui cargo ao usuário:
    `PUT /api/users/:id/role` -> `{ "roleId": 2 }`
3.  Sistema bloqueia acesso a rotas não permitidas (ex: `payment.approve`).

---

## 📊 Analytics e Dashboard

Acesse os relatórios via endpoints dedicados:

*   **Funil de Vendas**: `/api/analytics/funnel`
*   **Performance de Produtos**: `/api/analytics/reports/products`
*   **Insights de Clientes**: `/api/analytics/reports/customers`
*   **Análise de Carrinhos**: `/api/analytics/reports/carts`

---

## 📡 Endpoints da API

### 👤 Usuários (`/api/users`)
*   `POST /register` - Criar conta
*   `POST /login` - Autenticação
*   `GET /profile` - Dados do usuário
*   `POST /addresses` - Adicionar endereço

### 🛒 Produtos (`/api/products`)
*   `GET /` - Listar com filtros (cat, preço, busca)
*   `GET /:id` - Detalhes completos
*   `POST /` - Criar produto (Admin/Permissão)
*   `POST /:id/reviews` - Avaliar produto

### 🛍 Carrinho (`/api/cart`)
*   `POST /add` - Adicionar item
*   `DELETE /remove/:itemId` - Remover item
*   `GET /` - Ver carrinho atual

### 📦 Pedidos (`/api/orders`)
*   `POST /checkout` - Finalizar compra
*   `GET /` - Meus pedidos
*   `GET /:id` - Detalhes do pedido

### 💳 Pagamentos (`/api/payments`)
*   `POST /process` - Processar pagamento (MP, Asaas, Stripe)
    *   Body: `{ "orderId": 1, "provider": "stripe", "method": "credit_card", ... }`

### 🏭 Estoque (`/api/admin/inventory`)
*   `POST /adjust` - Ajuste manual (Entrada/Saída/Perda)
*   `GET /history` - Histórico de movimentações

### 🔐 Admin (`/api/admin`)
*   `GET /dashboard` - Resumo geral
*   `GET /roles` - Gerenciar cargos
*   `PUT /payments/:id/approve` - Aprovar pagamento manual

---

**Desenvolvido para Escalar.** 🚀
