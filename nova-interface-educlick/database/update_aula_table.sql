-- Atualiza a tabela 'aula' para garantir que os campos aceitam valores corretamente
ALTER TABLE aula
  ADD COLUMN conteudo TEXT,
  ADD COLUMN valor DECIMAL,
  ADD COLUMN duracao INTEGER;

-- Se os campos já existem, use:
-- ALTER TABLE aula ALTER COLUMN conteudo TYPE TEXT;
-- ALTER TABLE aula ALTER COLUMN valor TYPE DECIMAL;
-- ALTER TABLE aula ALTER COLUMN duracao TYPE INTEGER;

-- Permite valores nulos (caso não sejam obrigatórios)
ALTER TABLE aula ALTER COLUMN conteudo DROP NOT NULL;
ALTER TABLE aula ALTER COLUMN valor DROP NOT NULL;
ALTER TABLE aula ALTER COLUMN duracao DROP NOT NULL;

-- Exemplo para popular os campos manualmente (opcional)
-- UPDATE aula SET conteudo = 'Conteúdo exemplo', valor = 100, duracao = 60 WHERE id = 1;
