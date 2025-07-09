# 📚 EduClick

**EduClick** é um sistema de gerenciamento educacional e agendamento de aulas, criado para facilitar a conexão entre **professores** e **alunos**. Com uma interface simples e intuitiva, permite o gerenciamento de **horários, reservas e perfis** de forma prática e eficiente.

---

# 💡 Apresentação
O EduClick foi desenvolvido para atender a necessidade de professores autônomos e alunos que buscam praticidade na marcação de aulas particulares. O sistema permite que professores gerenciem suas aulas, horários e perfil, enquanto alunos podem visualizar perfis públicos e reservar horários disponíveis.

## 🧩 Funcionalidades

### Funcionalidades Gerais

- Página inicial com boas-vindas e acesso rápido a login e cadastro.
- Interface responsiva e amigável para todos os dispositivos.

---

### 👨‍🏫 Para Professores

#### 📥 Cadastro e Login
- Criação de conta e autenticação de acesso.

#### 🖥️ Dashboard do Professor
- Gerenciamento de aulas próprias.
- Criação de novas aulas com:
  - Título
  - Conteúdo
  - Valor
  - Duração
  - Número máximo de alunos
- Edição do perfil com:
  - Foto
  - Informações pessoais
  - Formação e experiência
  - Horários disponíveis
  - Conteúdos dominados
- Geração de **link público** para divulgação do perfil e agendamentos.
- Visualização dos agendamentos feitos pelos alunos.

#### 🕐 Gestão de Horários
- Definição de horários disponíveis e indisponíveis (folgas, feriados).
- Controle de vagas e status das aulas:
  - Disponível
  - Lotada
  - Cancelada

---

### 🧑‍🎓 Para Alunos e Público em Geral

#### 🔍 Visualização de Perfil Público do Professor
- Acesso via **link único**.
- Visualização de:
  - Aulas disponíveis
  - Valores e horários
  - Informações completas do professor

#### 🗓️ Reserva de Aulas
- Marcação de horários disponíveis informando **nome** e **telefone**.
- Confirmação da reserva com atualização automática de vagas.

#### 📆 Agendamento Direto
- Página exclusiva para agendamento com o professor.

---

## 🛠️ Tecnologias Utilizadas

- **Backend:** Node.js + Express
- **Frontend:** Parcel + TypeScript
- **API:** RESTful para operações de professores, aulas, reservas e autenticação
- **Sessão de usuário:** Autenticação com controle de sessão
- **Testes:** Automatizados com Jest

---

## 🚀 Execução e Acesso

### 1. Pré-requisitos

Antes de rodar o projeto localmente, certifique-se de ter instalado:

- **Node.js** (versão 16 ou superior)
- **npm** (geralmente já vem com o Node.js)

---

### 2. Instalação das Dependências

Execute o comando abaixo na raiz do projeto:

```bash
npm install
```

## ✅ Executando o Sistema
- Para iniciar o backend e o frontend simultaneamente:

```bash
npm start
```
- Esse comando utiliza o pacote concurrently para rodar ambos os servidores.

- Servidores iniciados em:

- 🔙 Backend (API): http://localhost:3000
- 🖥️ Frontend: http://localhost:1234

## 🎯 Acessando o EduClick
Após a execução, acesse no navegador:

🔗 http://localhost:1234

Você poderá:

- Realizar cadastro e login.
- Acessar seu painel de controle.
- Criar ou reservar aulas particulares.

