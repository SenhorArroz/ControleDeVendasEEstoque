# 💰 CashFlow

![Project Status](https://img.shields.io/badge/status-em_desenvolvimento-orange)
![License](https://img.shields.io/badge/license-MIT-blue)

**CashFlow** é uma aplicação web moderna para gestão de finanças pessoais. Desenvolvida com foco em performance e segurança de tipos (Type Safety) de ponta a ponta, permitindo que usuários gerenciem suas entradas e saídas, visualizem métricas e personalizem seus perfis.

## 🚀 Tecnologias Utilizadas (T3 Stack)

O projeto foi construído utilizando as melhores práticas do ecossistema React moderno:

* **[Next.js 15](https://nextjs.org/)** - Framework React com App Router.
* **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática para robustez.
* **[Tailwind CSS](https://tailwindcss.com/)** + **[DaisyUI](https://daisyui.com/)** - Estilização e Componentes UI (Temas Claro/Escuro).
* **[tRPC](https://trpc.io/)** - APIs Type-safe sem schemas manuais no front.
* **[Prisma](https://www.prisma.io/)** - ORM moderno para banco de dados.
* **[NextAuth.js (v5)](https://authjs.dev/)** - Autenticação segura (Google & Credenciais).
* **[Zod](https://zod.dev/)** - Validação de esquemas e formulários.

---

## ✨ Funcionalidades

- [x] **Autenticação Completa:** Login via E-mail/Senha e Google OAuth.
- [x] **Gestão de Perfil:** Upload de foto de perfil (Armazenamento Local via Server Actions).
- [x] **Dashboard:** Visão geral do usuário logado.
- [x] **Temas:** Suporte a Dark Mode e Light Mode.
- [ ] **Transações:** CRUD de Receitas e Despesas (Em breve).
- [ ] **Relatórios:** Gráficos mensais (Em breve).

---

## 📸 Screenshots

---


## 🛠️ Instalação e Configuração

Siga os passos abaixo para rodar o projeto localmente.

### Pré-requisitos

* Node.js (v18 ou superior)
* Gerenciador de pacotes (npm, pnpm ou yarn)
* Banco de dados (PostgreSQL, MySQL ou SQLite local)

### 1. Clone o repositório

```bash
git clone [https://github.com/SEU_USUARIO/cashflow.git](https://github.com/SEU_USUARIO/cashflow.git)
cd cashflow