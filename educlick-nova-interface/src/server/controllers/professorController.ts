// src/server/controllers/professorController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../../infrastructure/database/dataSource';
import admin from 'firebase-admin';
import { Professor } from '../entities/Professor';

export const criarProfessor = async (req: Request, res: Response) => {
  const { uid, nome, email } = req.body;
  if (!uid || !email) {
    return res.status(400).json({ error: 'UID e email são obrigatórios.' });
  }
  const usuarioRepo = AppDataSource.getRepository(Usuario);
  let usuario = await usuarioRepo.findOne({ where: { uid } });
  if (!usuario) {
    usuario = usuarioRepo.create({ uid, nome: nome || 'Professor', email, senha: '', tipo: 'professor' });
    await usuarioRepo.save(usuario);
  }
  const professorRepo = AppDataSource.getRepository(Professor);
  let professor = await professorRepo.findOne({ where: { uid } });
  if (professor) {
    // Atualiza vínculo se necessário
    if (!professor.usuario || professor.usuario.id !== usuario.id) {
      professor.usuario = usuario;
      await professorRepo.save(professor);
    }
    return res.json({ message: 'Professor já existe', professor });
  }
  // Cria novo professor vinculado ao usuário
  professor = professorRepo.create({ uid, usuario, nome_personalizado: nome || 'Professor' });
  await professorRepo.save(professor);
  res.json({ message: 'Professor criado com sucesso', professor });
};

export const uploadFotoPerfil = async (req: Request, res: Response) => {
  try {
    const professorIdRaw = req.session?.professorId;
    if (!professorIdRaw) return res.status(401).json({ error: 'Sessão inválida.' });
    const professorId = typeof professorIdRaw === 'string' ? parseInt(professorIdRaw, 10) : Number(professorIdRaw);
    if (!Number.isInteger(professorId) || professorId <= 0) return res.status(400).json({ error: 'ID inválido.' });

    const file = (req as any).file as any | undefined;
    if (!file) return res.status(400).json({ error: 'Arquivo "foto" não enviado.' });

    const bucket = admin.storage().bucket();
    if (!bucket) return res.status(500).json({ error: 'Storage não configurado.' });

    const ext = (file.originalname.split('.').pop() || 'jpg').toLowerCase();
    const path = `professores/${professorId}/perfil_${Date.now()}.${ext}`;
    const blob = bucket.file(path);

    await blob.save(file.buffer, {
      contentType: file.mimetype || 'image/jpeg',
      metadata: { cacheControl: 'public, max-age=31536000' }
    });
    await blob.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${encodeURIComponent(path)}`;

    // Atualiza professor.fotoUrl
    const professorRepo = AppDataSource.getRepository(Professor);
    const professor = await professorRepo.findOne({ where: { id: professorId } });
    if (professor) {
      professor.fotoUrl = publicUrl;
      await professorRepo.save(professor);
    }

    return res.json({ fotoUrl: publicUrl });
  } catch (err) {
    console.error('[UPLOAD FOTO PERFIL] Erro:', err);
    return res.status(500).json({ error: 'Erro ao fazer upload da foto.' });
  }
};
export const listarProfessores = async (req: Request, res: Response) => {
  res.json([]);
};
export const buscarProfessor = async (req: Request, res: Response) => {
  res.json({});
};
export const atualizarProfessor = async (req: Request, res: Response) => {
  try {
    const professorId = req.session?.professorId;
    if (!professorId) return res.status(401).json({ error: 'Sessão inválida.' });

    const professorRepo = AppDataSource.getRepository(Professor);
    const professor = await professorRepo.findOne({ where: { id: Number(professorId) }, relations: ['usuario'] });
    if (!professor) return res.status(404).json({ error: 'Professor não encontrado.' });

    // Atualiza os campos do perfil
    const { nome, email, telefone, especialidade, formacao, experiencia, linkUnico, fotoUrl } = req.body;
  if (nome) professor.nome = nome;
  if (telefone) professor.telefone = telefone;
    if (especialidade) professor.especialidade = especialidade;
    if (formacao) professor.formacao = formacao;
    if (experiencia) professor.experiencia = experiencia;
    if (linkUnico) professor.linkUnico = linkUnico;
    if (fotoUrl) professor.fotoUrl = fotoUrl;
    // Garante que o linkUnico sempre seja evidenciado
    if (!professor.linkUnico || professor.linkUnico.trim() === '') {
      professor.linkUnico = `prof-${professor.id}`;
    }
    // Atualiza dados do usuário vinculado
    if (email) professor.usuario.email = email;

    await professorRepo.save(professor);
    res.json({ message: 'Perfil atualizado!', professor });
  } catch (err) {
    console.error('[ATUALIZAR PERFIL] Erro:', err);
    res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
};
export const removerProfessor = async (req: Request, res: Response) => {
  res.json({ message: 'Professor removido!' });
};
import { Aula } from '../entities/Aula';
import { Reserva } from '../entities/Reserva';
import { Aluno } from '../entities/Aluno';
import { Usuario } from '../entities/Usuario';

export const listarAulasDoProfessor = async (req: Request, res: Response) => {
  try {
    const professorId = req.params.id || req.session?.professorId;
    if (!professorId) return res.status(400).json({ error: 'ID do professor não informado.' });

    // Buscar aulas do professor, incluindo reservas, aluno e usuario
    const aulas = await AppDataSource.getRepository(Aula).find({
      where: { professor: { id: Number(professorId) } },
      relations: ['professor', 'reservas', 'reservas.aluno', 'reservas.aluno.usuario']
    });

    // Adaptar formato para frontend
    const aulasFormatadas = aulas.map(aula => ({
      id: aula.id,
      titulo: aula.titulo,
      conteudo: aula.conteudo ?? '',
      valor: aula.valor ?? 0,
      duracao: aula.duracao ?? 0,
      data_hora: aula.data_hora,
      vagas_total: aula.vagas_total,
      vagas_ocupadas: aula.vagas_ocupadas,
      status: aula.status,
      reservas: (aula.reservas || []).map(reserva => ({
        id: reserva.id,
        status: reserva.status,
        data_reserva: reserva.data_reserva,
        aluno: reserva.aluno ? {
          id: reserva.aluno.id,
          nome: reserva.aluno.usuario?.nome ?? '',
          email: reserva.aluno.usuario?.email ?? '',
          // telefone: reserva.aluno.usuario?.telefone ?? '' // Não existe campo telefone em Usuario
        } : null
      }))
    }));
    res.json(aulasFormatadas);
  } catch (err) {
    console.error('[listarAulasDoProfessor] Erro:', err);
    res.status(500).json({ error: 'Erro ao buscar aulas do professor.' });
  }
};
