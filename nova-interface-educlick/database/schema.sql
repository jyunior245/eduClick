-- Tabela de Usuários
CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    uid VARCHAR(64) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL -- 'professor' ou 'aluno'
);

-- Tabela de Professores
CREATE TABLE professor (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuario(id),
    nome_personalizado VARCHAR(100),
    -- outros campos específicos
    UNIQUE(usuario_id)
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
    vagas_total INTEGER NOT NULL,
    vagas_ocupadas INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL, -- 'disponivel', 'lotada', 'cancelada'
    data_hora TIMESTAMP NOT NULL
);

-- Tabela de Reservas
CREATE TABLE reserva (
    id SERIAL PRIMARY KEY,
    aula_id INTEGER REFERENCES aula(id),
    aluno_id INTEGER REFERENCES aluno(id),
    status VARCHAR(20) NOT NULL, -- 'ativa', 'cancelada'
    data_reserva TIMESTAMP NOT NULL,
    data_cancelamento TIMESTAMP
);

-- Tabela de Logs (opcional)
CREATE TABLE log (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuario(id),
    acao VARCHAR(100),
    detalhes TEXT,
    data_log TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);