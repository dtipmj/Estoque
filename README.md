# 📦 Sistema de Gestão de Estoque

Sistema Web completo para **controle de estoque**, desenvolvido para ambientes institucionais, com foco em **organização, segurança, rastreabilidade e desempenho**.

---

## 🧾 Visão Geral

Este projeto é um **Sistema de Gestão de Estoque** desenvolvido com **React + Node.js**, integrando **leitor de código de barras**, controle de usuários, unidades e estoques, além de fluxo completo de **entrada e saída de produtos** e **assinatura de Ordem de Saída**.

O sistema foi projetado para rodar em **VPS Linux (Ubuntu Server)**, utilizando **Node.js em produção com PM2**, **Nginx como proxy reverso** e **MySQL como banco de dados**.

---

## ✨ Funcionalidades Principais

### 🔐 Autenticação e Usuários
- Login com **JWT**
- Controle de permissões por perfil:
  - `user`
  - `supervisor`
  - `admin`
  - `super_admin`
- Primeiro acesso com **troca obrigatória de senha**
- Upload de avatar
- Controle de acesso por **unidade** e **estoque**

### 📦 Controle de Estoque
- Cadastro de produtos
- Entrada de produtos
- Saída de produtos estilo **caixa de supermercado**
- Integração com **leitor de código de barras**
- Atualização de estoque em tempo real
- Prevenção de estoque negativo
- Histórico completo de movimentações

### 🏬 Estrutura Organizacional
- Cadastro de unidades
- Cadastro de estoques (almoxarifados)
- Vínculo de usuários a unidades e estoques

### 🧾 Ordem de Saída
- Geração de Ordem de Saída (OS)
- Assinatura digital
- Registro permanente no banco de dados

### 📊 Relatórios
- Relatório de estoque
- Relatório de movimentações
- Histórico por produto, usuário e estoque

---

## 🧱 Arquitetura do Sistema

```text
┌───────────────┐
│   Frontend    │  React + Vite
│ (Nginx - Web) │
└───────▲───────┘
        │ HTTP
┌───────┴───────┐
│   Backend     │  Node.js + Express (API REST)
│ (PM2 + Nginx) │
└───────▲───────┘
        │ SQL
┌───────┴───────┐
│ Banco de Dados│  MySQL
└───────────────┘
```

---

## 🛠️ Tecnologias Utilizadas

### 🌐 Frontend
- **React JS**
- **Vite**
- JavaScript (ES6+)
- CSS modularizado
- Integração com leitor de código de barras

### ⚙️ Backend
- **Node.js**
- **Express**
- JWT (autenticação)
- bcrypt (hash de senha)
- Sequelize (ORM)
- Multer (upload de arquivos)
- PM2 (process manager)

### 🗄️ Banco de Dados
- **MySQL**
- Modelagem relacional
- Chaves estrangeiras
- Controle de integridade

### 🐧 Infraestrutura
- **VPS Linux (Ubuntu Server)**
- **VMware**
- **Nginx** (proxy reverso)
- **PM2**
- **Git**

---

## ⚙️ Variáveis de Ambiente

### 📌 Backend (`.env`)

```env
DB_HOST=IPDOSERVIDOR
DB_USER=USUARIO
DB_PASSWORD=SENHA
DB_NAME=estoque_db

PORT=4000

JWT_SECRET=JWT-SECRETO
JWT_EXPIRES_IN=1d

FRONTEND_URL=http://estoque.seudominio.com
```

---

### 📌 Frontend (`.env`)

```env
VITE_API_URL=http://api.estoque.seudominio.com
```

---

## 🚀 Instalação em VPS Linux (Ubuntu)

### 1️⃣ Atualizar o sistema
```bash
sudo apt update && sudo apt upgrade -y
```

---

### 2️⃣ Instalar dependências básicas
```bash
sudo apt install -y git curl unzip nginx mysql-server
```

---

### 3️⃣ Instalar Node.js (LTS)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

---

### 4️⃣ Instalar PM2
```bash
sudo npm install -g pm2
```

---

### 5️⃣ Clonar o projeto
```bash
git clone https://github.com/dtipmj/Estoque.git
cd Estoque
```

---

### 6️⃣ Configurar Banco de Dados
```bash
mysql -u root -p
```

```sql
CREATE DATABASE estoque_db;
CREATE USER 'USER'@'%' IDENTIFIED BY 'SENHA';
GRANT ALL PRIVILEGES ON estoque_db.* TO 'USER'@'%';
FLUSH PRIVILEGES;
```

---

### 7️⃣ Configurar Backend
```bash
cd backend
cp .env.example .env
nano .env
```

```bash
npm install
npx sequelize db:migrate
npx sequelize db:seed:all
npm run build
pm2 start dist/server.js --name estoque-backend
pm2 save
```

---

### 8️⃣ Configurar Frontend
```bash
cd ../frontend
npm install
npm run build
```

---

## 🌐 Configuração do Nginx (Frontend e Backend Separados)

### 🖥️ Frontend — Nginx
Arquivo:
```bash
sudo nano /etc/nginx/sites-available/estoque-frontend
```

```nginx
server {
  listen 80;
  server_name estoque.seudominio.com;

  root /home/deploy/Estoque/frontend/dist;
  index index.html;

  location / {
    try_files $uri /index.html;
  }
}
```

Ativar:
```bash
sudo ln -s /etc/nginx/sites-available/estoque-frontend /etc/nginx/sites-enabled/
```

---

### ⚙️ Backend — Nginx
Arquivo:
```bash
sudo nano /etc/nginx/sites-available/estoque-backend
```

```nginx
server {
  listen 80;
  server_name api.estoque.seudominio.com;

  location / {
    proxy_pass http://127.0.0.1:4000;
    proxy_http_version 1.1;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Ativar e reiniciar:
```bash
sudo ln -s /etc/nginx/sites-available/estoque-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 Segurança
- Senhas criptografadas com bcrypt
- Autenticação JWT
- Expiração de token
- Controle de acesso por perfil
- Isolamento por unidade e estoque

---

## 📈 Evolução do Sistema
- Estrutura preparada para Docker
- Fácil expansão de módulos
- Base pronta para relatórios avançados
- Suporte futuro a HTTPS

---

## 👨‍💻 Autor

Projeto desenvolvido por **Daniel**, com foco em:
- Sistemas corporativos
- Segurança da informação
- Infraestrutura Linux
- Boas práticas de desenvolvimento
- Deploy em VPS

---
