-- Adiciona os campos nome e telefone à tabela professor
ALTER TABLE professor
  ADD COLUMN nome TEXT,
  ADD COLUMN telefone TEXT;

ALTER TABLE professor ALTER COLUMN nome DROP NOT NULL;
ALTER TABLE professor ALTER COLUMN telefone DROP NOT NULL;

-- Garante que o campo linkUnico seja sempre preenchido

-- Garante que a coluna linkUnico existe
ALTER TABLE professor ADD COLUMN IF NOT EXISTS "linkUnico" VARCHAR(255) UNIQUE;

-- Atualiza o linkUnico do professor com id 2
UPDATE professor SET "linkUnico" = 'prof-2' WHERE id = 2;
UPDATE professor SET linkUnico = CONCAT('prof-', id) WHERE linkUnico IS NULL OR TRIM(linkUnico) = '';
-- Adiciona campos de perfil à tabela professor
ALTER TABLE professor
  ADD COLUMN especialidade TEXT,
  ADD COLUMN formacao TEXT,
  ADD COLUMN experiencia TEXT,
  ADD COLUMN linkUnico TEXT UNIQUE;

-- Permite valores nulos
ALTER TABLE professor ALTER COLUMN especialidade DROP NOT NULL;
ALTER TABLE professor ALTER COLUMN formacao DROP NOT NULL;
ALTER TABLE professor ALTER COLUMN experiencia DROP NOT NULL;
ALTER TABLE professor ALTER COLUMN linkUnico DROP NOT NULL;
