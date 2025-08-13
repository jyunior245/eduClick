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

---

## 🔔 Notificações Push (FCM)

### Visão geral
- O sistema usa Firebase Cloud Messaging (FCM) para enviar notificações de:
  - Reagendamento de aula.
  - Lembrete 30 minutos antes do início da aula.
- O token do aluno (sem cadastro) é coletado na página pública no momento em que ele clica em "Confirmar reserva" e é salvo em `reserva.fcmToken` e também em `usuario.fcmToken` para notificações futuras.

### Configuração necessária (.env)
Crie/edite o arquivo `.env` na raiz com, no mínimo, a VAPID Public Key do seu projeto Firebase Web:

```
FIREBASE_VAPID_KEY=SEU_VAPID_PUBLIC_KEY
```

Outras variáveis de backend (já existentes no projeto) devem estar configuradas para o Firebase Admin (env vars ou service account) e banco de dados.

### Como funciona no frontend
- O Service Worker de FCM é registrado antes do app em `src/client/index.html` usando Parcel `?url`, garantindo o MIME correto.
- Em `src/client/services/notifications.ts`:
  - A função `setupPushAfterLogin()` registra/usa o SW existente e chama `getToken` com o `serviceWorkerRegistration` explícito.
  - A função `getPublicFcmToken()` é chamada na confirmação de reserva pública para obter o token do dispositivo do aluno.
  - Há fallbacks para obter a VAPID a partir de `.env`, `window.__VAPID_KEY`, `<meta name="vapid-key">` e `localStorage['FIREBASE_VAPID_KEY']` (com prompt opcional em dev).

### Requisitos do navegador
- Permitir notificações para `http://localhost:1234` (ou https em produção).
- Origem segura: usar `https` ou `http://localhost` (não funciona em `file://`).

### Solução de problemas FCM
- Erro "unsupported MIME type (text/html)" ao registrar SW:
  - Garanta hard refresh (Ctrl+Shift+R). O SW é registrado via `?url` em `index.html`.
  - Abra `http://localhost:1234/firebase-messaging-sw.js?url` (a URL resolvida no log) e confirme que retorna JavaScript.
- VAPID ausente:
  - Configure `FIREBASE_VAPID_KEY` em `.env` e reinicie `npm start`.
  - Em dev, você também pode definir no console: `localStorage.setItem('FIREBASE_VAPID_KEY', 'SUA_CHAVE')`.

---

## 🔄 Atualização automática de telas
- O dashboard do professor atualiza automaticamente quando há novas reservas por:
  - Push `AULAS_UPDATED` (quando disponível).
  - BroadcastChannel entre abas (reserva pública envia e o dashboard escuta).
  - Atualização ao focar a aba do dashboard.
  - Atualização periódica leve (15s) como fallback.

---

## 🧪 Fluxos principais
- Reserva pública:
  - Aluno confirma → cliente obtém token FCM → envia ao backend → backend salva → dashboard atualiza automático.
- Reagendar aula:
  - Backend usa `NotificationService.notificarAulaReagendada` para notificar todos os alunos com reserva ativa (usa `usuario.fcmToken` e `reserva.fcmToken`).
- Lembrete 30 min antes:
  - Agendador simples no servidor chama `NotificationService.enviarLembretesAulas()` a cada 1 minuto.

