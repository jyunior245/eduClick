-- =============================================================
-- Projeto: EduClick - Script Completo (DDL, DML, DQL)
-- Equipe: Vanessa  Pereira | Fabricio Mota | Francisnilto dos Santos
-- Disciplina: Banco de Dados II
-- Data: 13-08-2025
-- Descrição:
--   EduClick é uma plataforma de agendamento de aulas que conecta professores e alunos.
--   Professores cadastram e gerenciam aulas (título, conteúdo, valor, duração, vagas e data/hora),
--   enquanto alunos reservam vagas de forma simples. O sistema oferece calendário, gerenciamento
--   de reservas, reagendamento de aulas e envio de notificações push aos alunos impactados (via Firebase).
--   A aplicação utiliza backend em Node.js/Express com TypeORM e PostgreSQL, e frontend com
--   atualização em tempo real (eventos e Service Worker), priorizando estabilidade, integridade dos
--   dados e boa experiência do usuário.
--   Este script contém:
--   1) Modelo Físico (DDL) baseado no arquivo schema.sql do projeto
--   2) Inserção de dados (DML) para popular as tabelas com exemplos realistas
--   3) 10 Consultas (DQL) exemplificando operações comuns do sistema
-- Observações:
--   - Comentários explicam cada trecho/consulta.
-- =============================================================

-- =============================================================
-- 1) DDL - Modelo Físico (conforme database/schema.sql)
-- =============================================================

-- Criar banco e conectar (executar via psql)
-- Observação: se o banco já existir, remova a linha CREATE DATABASE ou ignore o erro
CREATE DATABASE educlick;
\c educlick


CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    uid VARCHAR(64) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- 'professor' ou 'aluno'
    fcmToken VARCHAR(255)
);

-- Tabela de Professores
CREATE TABLE professor (
    id SERIAL PRIMARY KEY,
    -- referência ao usuário (obrigatório e único)
    usuario_id INTEGER REFERENCES usuario(id),
    UNIQUE(usuario_id),
    -- campos do domínio
    uid VARCHAR(64) UNIQUE,
    nome VARCHAR(100),
    telefone VARCHAR(50),
    nome_personalizado VARCHAR(100),
    especialidade VARCHAR(255),
    formacao VARCHAR(255),
    experiencia TEXT,
    "linkUnico" VARCHAR(255) UNIQUE,
    "fotoUrl" VARCHAR(500)
);

-- Tabela de Alunos
CREATE TABLE aluno (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuario(id),
    -- outros campos específicos
    UNIQUE(usuario_id)
);

-- Tabela de Aulas
CREATE TABLE aula (
    id SERIAL PRIMARY KEY,
    professor_id INTEGER REFERENCES professor(id),
    titulo VARCHAR(100) NOT NULL,
    conteudo TEXT,
    valor DECIMAL(10,2),
    duracao INTEGER,
    vagas_total INTEGER NOT NULL,
    vagas_ocupadas INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL, -- 'disponivel', 'lotada', 'cancelada', 'reagendada'
    data_hora TIMESTAMP NOT NULL
);

-- Tabela de Reservas
CREATE TABLE reserva (
    id SERIAL PRIMARY KEY,
    aula_id INTEGER REFERENCES aula(id),
    aluno_id INTEGER REFERENCES aluno(id),
    status VARCHAR(20) NOT NULL, -- 'ativa', 'cancelada'
    -- dados informados na reserva pública
    nome VARCHAR(255),
    email VARCHAR(255),
    telefone VARCHAR(50),
    -- token FCM do dispositivo no momento da reserva
    fcmToken VARCHAR(255),
    data_reserva TIMESTAMP NOT NULL,
    data_cancelamento TIMESTAMP,
    reminder_enviado BOOLEAN DEFAULT FALSE
);

-- Tabela de Logs (opcional)
CREATE TABLE log (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuario(id),
    acao VARCHAR(100),
    detalhes TEXT,
    data_log TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices de apoio (otimizam consultas)
CREATE INDEX IF NOT EXISTS idx_usuario_tipo ON usuario(tipo);
CREATE INDEX IF NOT EXISTS idx_professor_usuario ON professor(usuario_id);
CREATE INDEX IF NOT EXISTS idx_aula_professor ON aula(professor_id);
CREATE INDEX IF NOT EXISTS idx_aula_status ON aula(status);
CREATE INDEX IF NOT EXISTS idx_reserva_aula ON reserva(aula_id);
CREATE INDEX IF NOT EXISTS idx_reserva_aluno ON reserva(aluno_id);
CREATE INDEX IF NOT EXISTS idx_reserva_status ON reserva(status);


-- =============================================================
-- 2) DML - Inserção de Dados de Exemplo
--    Observação: valores ilustrativos para testes e para rodar DQLs
-- =============================================================

-- Usuários (2 professores, 3 alunos)
INSERT INTO usuario (uid, nome, email, senha, tipo, fcmToken) VALUES
('prof-uid-1', 'Maria Silva', 'maria.silva@exemplo.com', 'hash_senha', 'professor', 'fcm_token_prof1'),
('prof-uid-2', 'João Souza',  'joao.souza@exemplo.com',  'hash_senha', 'professor', 'fcm_token_prof2'),
('aluno-uid-1','Ana Lima',   'ana.lima@exemplo.com',   'hash_senha', 'aluno',     'fcm_token_aluno1'),
('aluno-uid-2','Bruno Reis', 'bruno.reis@exemplo.com', 'hash_senha', 'aluno',     'fcm_token_aluno2'),
('aluno-uid-3','Carla Dias', 'carla.dias@exemplo.com', 'hash_senha', 'aluno',     'fcm_token_aluno3');

-- Professores (referenciam usuarios 1 e 2)
INSERT INTO professor (usuario_id, uid, nome, telefone, nome_personalizado, especialidade, formacao, experiencia, "linkUnico", "fotoUrl") VALUES
(1, 'prof-uid-1', 'Maria Silva', '(11) 99999-1111', 'profa-maria', 'Matemática', 'Licenciatura em Matemática', '10 anos de experiência', 'profa-maria', 'https://img.exemplo.com/maria.jpg'),
(2, 'prof-uid-2', 'João Souza',  '(21) 98888-2222', 'prof-joao',   'Física',     'Licenciatura em Física',     '8 anos de experiência',  'prof-joao',   'https://img.exemplo.com/joao.jpg');

-- Alunos (referenciam usuarios 3,4,5)
INSERT INTO aluno (usuario_id) VALUES (3), (4), (5);

-- Aulas (2 do prof 1, 1 do prof 2)
INSERT INTO aula (professor_id, titulo, conteudo, valor, duracao, vagas_total, vagas_ocupadas, status, data_hora) VALUES
(1, 'Álgebra Básica', 'Conjuntos, operações e propriedades', 80.00, 60, 5, 0, 'disponivel', NOW() + INTERVAL '2 days'),
(1, 'Geometria Plana', 'Ângulos, triângulos e polígonos',     90.00, 90, 3, 1, 'reagendada', NOW() + INTERVAL '5 days'),
(2, 'Mecânica Clássica','Leis de Newton e aplicações',        120.00, 120, 4, 2, 'lotada',    NOW() + INTERVAL '1 day');

-- Reservas (algumas ativas, uma cancelada; com fcmToken de reserva)
-- Assumindo aulas id: 1,2,3 e alunos id: 1,2,3 (em ordem de inserção)
INSERT INTO reserva (aula_id, aluno_id, status, nome, email, telefone, fcmToken, data_reserva, reminder_enviado) VALUES
(1, 1, 'ativa',     'Ana Lima',   'ana.lima@exemplo.com',   '(11) 90000-0001', 'fcm_token_aluno1_reserva', NOW(), FALSE),
(1, 2, 'cancelada', 'Bruno Reis', 'bruno.reis@exemplo.com', '(11) 90000-0002', 'fcm_token_aluno2_reserva', NOW() - INTERVAL '1 day', FALSE),
(2, 3, 'ativa',     'Carla Dias', 'carla.dias@exemplo.com', '(11) 90000-0003', 'fcm_token_aluno3_reserva', NOW(), TRUE),
(3, 1, 'ativa',     'Ana Lima',   'ana.lima@exemplo.com',   '(11) 90000-0001', 'fcm_token_aluno1_reserva', NOW(), TRUE);

-- Logs exemplo
INSERT INTO log (usuario_id, acao, detalhes) VALUES
(1, 'CRIAR_AULA', 'Usuário 1 criou a aula 1'),
(3, 'RESERVA',    'Usuário 3 reservou a aula 1'),
(4, 'RESERVA',    'Usuário 4 reservou e cancelou a aula 1');


-- =============================================================
-- 3) DQL - 10 Consultas com comentários explicativos
-- =============================================================

-- 1) Listar aulas disponíveis (status = 'disponivel') com nome do professor e data/hora
SELECT a.id, a.titulo, a.status, a.data_hora,
       p.nome AS professor
FROM aula a
JOIN professor p ON p.id = a.professor_id
WHERE LOWER(a.status) = 'disponivel'
ORDER BY a.data_hora ASC;

-- 2) Contar reservas ativas por aula
SELECT a.id AS aula_id, a.titulo,
       COUNT(r.id) FILTER (WHERE LOWER(r.status) = 'ativa') AS reservas_ativas
FROM aula a
LEFT JOIN reserva r ON r.aula_id = a.id
GROUP BY a.id, a.titulo
ORDER BY a.id;

-- 3) Aulas lotadas (vagas_ocupadas >= vagas_total)
SELECT id, titulo, vagas_ocupadas, vagas_total
FROM aula
WHERE vagas_ocupadas >= vagas_total;

-- 4) Próximas aulas em até 7 dias com professor
SELECT a.id, a.titulo, a.data_hora, p.nome AS professor
FROM aula a
JOIN professor p ON p.id = a.professor_id
WHERE a.data_hora BETWEEN NOW() AND NOW() + INTERVAL '7 days'
ORDER BY a.data_hora ASC;

-- 5) Reservas de um aluno (por email), com situação
SELECT r.id, r.nome, r.email, r.status, a.titulo, a.data_hora
FROM reserva r
JOIN aula a ON a.id = r.aula_id
WHERE LOWER(r.email) = LOWER('ana.lima@exemplo.com')
ORDER BY r.data_reserva DESC;

-- 6) Aulas reagendadas com total de reservas ativas
SELECT a.id, a.titulo, a.data_hora,
       COUNT(r.id) FILTER (WHERE LOWER(r.status) = 'ativa') AS reservas_ativas
FROM aula a
LEFT JOIN reserva r ON r.aula_id = a.id
WHERE LOWER(a.status) = 'reagendada'
GROUP BY a.id, a.titulo, a.data_hora
ORDER BY a.data_hora;

-- 7) Professores com total de aulas e média de valor
SELECT p.nome AS professor,
       COUNT(a.id) AS total_aulas,
       ROUND(AVG(a.valor), 2) AS media_valor
FROM professor p
LEFT JOIN aula a ON a.professor_id = p.id
GROUP BY p.nome
ORDER BY total_aulas DESC, media_valor DESC;

-- 8) Alunos com fcmToken cadastrado (para push) e quantidade de reservas
SELECT u.nome AS aluno, u.fcmToken,
       COUNT(r.id) AS total_reservas
FROM usuario u
JOIN aluno al ON al.usuario_id = u.id
LEFT JOIN reserva r ON r.aluno_id = al.id
WHERE u.fcmToken IS NOT NULL AND LENGTH(TRIM(u.fcmToken)) > 0
GROUP BY u.nome, u.fcmToken
ORDER BY total_reservas DESC;

-- 9) Reservas com lembrete ainda não enviado em aulas que começam nos próximos 30 minutos
SELECT r.id AS reserva_id, a.id AS aula_id, a.titulo, a.data_hora, r.nome, r.email
FROM aula a
JOIN reserva r ON r.aula_id = a.id
WHERE a.data_hora BETWEEN NOW() + INTERVAL '30 minutes' AND NOW() + INTERVAL '31 minutes'
  AND (r.reminder_enviado = FALSE OR r.reminder_enviado IS NULL)
  AND LOWER(r.status) = 'ativa';

-- 10) Histórico de ações (log) com nome do usuário
SELECT l.id, u.nome AS usuario, l.acao, l.detalhes, l.data_log
FROM log l
LEFT JOIN usuario u ON u.id = l.usuario_id
ORDER BY l.data_log DESC, l.id DESC;



