Perfeito 👍
Segue abaixo o **README.md completo**, bem **organizado, profissional e pronto para publicar no GitHub**.

Você pode **copiar e colar direto** no seu repositório.

---

````markdown
# 📦 Sistema de Gestão de Estoque

Sistema Web completo para **controle de estoque**, desenvolvido para ambientes institucionais, com foco em **organização, segurança, rastreabilidade e desempenho**.

---

## 🧾 Visão Geral

Este projeto é um **Sistema de Gestão de Estoque** desenvolvido com **React + Node.js**, integrando **leitor de código de barras**, controle de usuários, unidades e estoques, além de fluxo completo de **entrada e saída de produtos** e **assinatura de Ordem de Saída**.

O sistema foi projetado para rodar em **VPS Linux (Ubuntu Server)**, utilizando **Nginx como proxy reverso**, **Node.js em produção com PM2** e **MySQL como banco de dados**.

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
│   (Web)       │
└───────▲───────┘
        │ HTTP
┌───────┴───────┐
│   Backend     │  Node.js + Express (API REST)
└───────▲───────┘
        │ SQL
┌───────┴───────┐
│ Banco de Dados│  MySQL
└───────────────┘
````

---

## 🛠️ Tecnologias Utilizadas

### 🌐 Frontend

* **React JS**
* **Vite**
* JavaScript (ES6+)
* CSS modularizado
* Integração com leitor de código de barras

### ⚙️ Backend

* **Node.js**
* **Express**
* JWT (autenticação)
* bcrypt (hash de senha)
* Sequelize (ORM)
* Multer (upload de arquivos)
* PM2 (process manager)

### 🗄️ Banco de Dados

* **MySQL**
* Modelagem relacional
* Chaves estrangeiras
* Controle de integridade

### 🐧 Infraestrutura

* **VPS Linux (Ubuntu Server)**
* **VMware** (ambiente virtualizado)
* **Nginx** (proxy reverso)
* **PM2** (execução em produção)
* **Git** (versionamento)

---

## ⚙️ Variáveis de Ambiente

### 📌 Backend (`.env`)

```env
DB_HOST=192.168.10.38
DB_USER=DTI
DB_PASSWORD=DTI@2025
DB_NAME=estoque_db

PORT=4000

JWT_SECRET=579a5bd96cf8ea9c8a13c865912bd8d22889ae3325d6b1a069b107a2
JWT_EXPIRES_IN=1d

FRONTEND_URL=http://localhost:5173
```

---

### 📌 Frontend (`.env`)

```env
VITE_API_URL=http://localhost:4000
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
CREATE USER 'DTI'@'%' IDENTIFIED BY 'DTI@2025';
GRANT ALL PRIVILEGES ON estoque_db.* TO 'DTI'@'%';
FLUSH PRIVILEGES;
```

---

### 7️⃣ Configurar Backend

```bash
cd backend
cp .env.example .env
nano .env
```

Instalar dependências e preparar banco:

```bash
npm install
npx sequelize db:migrate
npx sequelize db:seed:all
npm run build
```

Iniciar com PM2:

```bash
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

### 9️⃣ Configurar Nginx (sem HTTPS)

```bash
sudo nano /etc/nginx/sites-available/estoque
```

```nginx
server {
  server_name localhost;

  location / {
    root /home/deploy/estoque/frontend/dist;
    index index.html;
    try_files $uri /index.html;
  }

  location /api {
    proxy_pass http://localhost:4000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

Ativar e reiniciar:

```bash
sudo ln -s /etc/nginx/sites-available/estoque /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 Segurança

* Senhas criptografadas com bcrypt
* Autenticação via JWT
* Expiração de token
* Controle de acesso por perfil
* Isolamento por unidade e estoque

---

## 📈 Evolução do Sistema

* Arquitetura preparada para Docker
* Fácil integração com novos módulos
* Base pronta para relatórios avançados
* Pode ser adaptado para HTTPS futuramente

---

## 👨‍💻 Autor

Projeto desenvolvido por **Daniel**, com foco em:

* Boas práticas de desenvolvimento
* Segurança
* Organização de código
* Infraestrutura em VPS Linux
* Sistemas corporativos de controle

---

```
