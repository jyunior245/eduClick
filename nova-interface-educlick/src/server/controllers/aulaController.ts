// src/server/controllers/aulaController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../../infrastructure/database/dataSource';
import { Aula, StatusAula } from '../entities/Aula';
import { Professor } from '../entities/Professor';

export const criarAula = async (req: Request, res: Response) => {
  try {
    console.log('[CRIAR AULA] Sessão:', JSON.stringify(req.session));
    const professorIdRaw = req.session?.professorId;
    if (!professorIdRaw) {
      return res.status(401).json({ error: 'Professor não autenticado. Sessão inválida.' });
    }

    const professorId = typeof professorIdRaw === 'string' ? parseInt(professorIdRaw, 10) : Number(professorIdRaw);
    if (Number.isNaN(professorId) || !Number.isInteger(professorId) || professorId <= 0) {
      return res.status(400).json({ error: 'ID do professor inválido na sessão.' });
    }

    const vagas_total = typeof req.body.vagas_total === 'string'
      ? parseInt(req.body.vagas_total, 10)
      : Number(req.body.vagas_total);

  const { titulo, data_hora, conteudo, valor, duracao } = req.body;
    if (!titulo) return res.status(400).json({ error: 'titulo obrigatório.' });
    if (Number.isNaN(vagas_total) || !Number.isInteger(vagas_total) || vagas_total <= 0) {
      return res.status(400).json({ error: 'vagas_total obrigatório e deve ser inteiro positivo.' });
    }
    if (!data_hora) return res.status(400).json({ error: 'data_hora obrigatório.' });
    const dataHoraValida = !isNaN(Date.parse(data_hora));
    if (!dataHoraValida) return res.status(400).json({ error: 'data_hora inválido.' });

    const professorRepo = AppDataSource.getRepository(Professor);
    const professor = await professorRepo.findOne({ where: { id: professorId } });
    if (!professor) return res.status(404).json({ error: 'Professor não encontrado.' });

    const aulaRepo = AppDataSource.getRepository(Aula);
    const aula = aulaRepo.create({
      professor,
      titulo,
      vagas_total,
      data_hora,
      conteudo,
      valor,
      duracao
    });
    await aulaRepo.save(aula);
    res.status(201).json(aula);
  } catch (err) {
    console.error('[CRIAR AULA] Erro:', err);
    res.status(500).json({ error: 'Erro ao criar aula.' });
  }
};

export const reagendarAulaServidor = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = parseInt(rawId, 10);
    if (Number.isNaN(id) || !Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: `ID da aula inválido: ${String(rawId)}` });
    }

    const { nova_data_hora } = req.body as { nova_data_hora?: string };

    const aulaRepo = AppDataSource.getRepository(Aula);
    const aula = await aulaRepo.findOne({ where: { id } });
    if (!aula) return res.status(404).json({ error: 'Aula não encontrada.' });

    // Atualiza data/hora se enviada
    if (nova_data_hora) {
      const dt = new Date(nova_data_hora);
      if (isNaN(dt.getTime())) {
        return res.status(400).json({ error: 'nova_data_hora inválida.' });
      }
      aula.data_hora = dt;
    }

    // Marca como reagendada
    aula.status = StatusAula.REAGENDADA;

    await aulaRepo.save(aula);
    return res.json({ message: 'Aula reagendada com sucesso', aula });
  } catch (err) {
    console.error('[REAGENDAR AULA] Erro:', err);
    return res.status(500).json({ error: 'Erro ao reagendar aula.' });
  }
};

export const listarAulas = async (req: Request, res: Response) => {
  try {
    const aulaRepo = AppDataSource.getRepository(Aula);
    const aulas = await aulaRepo.find({ relations: ['professor'] });
    res.json(aulas);
  } catch (err) {
    console.error('[LISTAR AULAS] Erro:', err);
    res.status(500).json({ error: 'Erro ao listar aulas.' });
  }
};

export const buscarAula = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = parseInt(rawId, 10);
    if (Number.isNaN(id) || !Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: `ID da aula inválido: ${String(rawId)}` });
    }

    const aulaRepo = AppDataSource.getRepository(Aula);
    const aula = await aulaRepo.findOne({ where: { id }, relations: ['professor'] });
    if (!aula) return res.status(404).json({ error: 'Aula não encontrada.' });
    res.json(aula);
  } catch (err) {
    console.error('[BUSCAR AULA] Erro:', err);
    res.status(500).json({ error: 'Erro ao buscar aula.' });
  }
};

export const atualizarAula = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = parseInt(rawId, 10);
    if (Number.isNaN(id) || !Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: `ID da aula inválido: ${String(rawId)}` });
    }

    const aulaRepo = AppDataSource.getRepository(Aula);
    const aula = await aulaRepo.findOne({ where: { id } });
    if (!aula) return res.status(404).json({ error: 'Aula não encontrada.' });

    // Atualizar apenas campos permitidos
    const camposPermitidos = ['titulo', 'conteudo', 'valor', 'duracao', 'vagas_total', 'data_hora', 'status', 'observacoes'];
    for (const campo of camposPermitidos) {
      if (req.body[campo] !== undefined) {
        (aula as any)[campo] = req.body[campo];
      }
    }
    // Se vagas_total for alterado, garantir que vagas_ocupadas não seja maior
    if (req.body.vagas_total !== undefined) {
      const vagasTotal = Number(req.body.vagas_total);
      if (!isNaN(vagasTotal) && vagasTotal < aula.vagas_ocupadas) {
        aula.vagas_ocupadas = vagasTotal;
      }
    }
    await aulaRepo.save(aula);
    res.json({ message: 'Aula atualizada!', aula });
  } catch (err) {
    console.error('[ATUALIZAR AULA] Erro:', err);
    res.status(500).json({ error: 'Erro ao atualizar aula.' });
  }
};

export const removerAula = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = parseInt(rawId, 10);
    if (Number.isNaN(id) || !Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: `ID da aula inválido: ${String(rawId)}` });
    }

    const aulaRepo = AppDataSource.getRepository(Aula);
    const aula = await aulaRepo.findOne({ where: { id } });
    if (!aula) return res.status(404).json({ error: 'Aula não encontrada.' });
    await aulaRepo.remove(aula);
    res.json({ message: 'Aula removida!' });
  } catch (err) {
    console.error('[REMOVER AULA] Erro:', err);
    res.status(500).json({ error: 'Erro ao remover aula.' });
  }
};

export const listarMinhasAulas = async (req: Request, res: Response) => {
  try {
    console.log('[MINHAS AULAS] Sessão recebida:', JSON.stringify(req.session));
    const professorIdRaw = req.session?.professorId;
    console.log('[MINHAS AULAS] professorIdRaw:', professorIdRaw);
    if (!professorIdRaw) {
      return res.status(401).json({ error: 'Professor não autenticado. Sessão inválida. Nenhum professorId na sessão.' });
    }

    const professorId = typeof professorIdRaw === 'string' ? parseInt(professorIdRaw, 10) : Number(professorIdRaw);
    if (Number.isNaN(professorId) || !Number.isInteger(professorId) || professorId <= 0) {
      return res.status(400).json({ error: `ID do professor inválido: ${String(professorIdRaw)}` });
    }

    const aulaRepo = AppDataSource.getRepository(Aula);
    // Buscar aulas do professor, incluindo reservas, aluno e usuario
    const aulas = await aulaRepo.find({
      where: { professor: { id: professorId } },
      relations: ['professor', 'reservas', 'reservas.aluno', 'reservas.aluno.usuario']
    });

    // Adaptar formato para frontend e atualizar status se lotada
    const aulasFormatadas = aulas.map(aula => {
      const vagasOcupadas = aula.vagas_ocupadas ?? (aula.reservas ? aula.reservas.length : 0);
      const status = vagasOcupadas >= aula.vagas_total ? 'lotada' : aula.status;
      return {
        id: aula.id,
        titulo: aula.titulo,
        conteudo: aula.conteudo ?? '',
        valor: aula.valor ?? 0,
        duracao: aula.duracao ?? 0,
        data_hora: aula.data_hora,
        vagas_total: aula.vagas_total,
        vagas_ocupadas: vagasOcupadas,
        status,
        reservas: (aula.reservas || []).map(reserva => {
          let nome = '';
          let email = '';
          let telefone = reserva.telefone || '';
          if (reserva.aluno && reserva.aluno.usuario) {
            nome = reserva.aluno.usuario.nome || '';
            email = reserva.aluno.usuario.email || '';
          }
          return {
            id: reserva.id,
            status: reserva.status,
            data_reserva: reserva.data_reserva,
            nome,
            email,
            telefone
          };
        })
      };
    });
    res.json(aulasFormatadas);
  } catch (err) {
    console.error('[MINHAS AULAS] Erro:', err);
    res.status(500).json({ error: 'Erro ao listar minhas aulas.' });
  }
};

export const cancelarReserva = async (req: Request, res: Response) => {
  try {
    console.log('[cancelarReserva] chamada recebida:', req.method, req.originalUrl);
    const { id: aulaId } = req.params;
    const { nome, telefone } = req.body;
    console.log('[cancelarReserva] params:', { aulaId });
    console.log('[cancelarReserva] body:', { nome, telefone });
    
    // Verificar se os dados obrigatórios foram fornecidos
    if (!nome || !telefone) {
      return res.status(400).json({ error: "Nome e telefone são obrigatórios" });
    }
    
    const aulaRepository = AppDataSource.getRepository(Aula);
    const aula = await aulaRepository.findOne({
      where: { id: parseInt(aulaId) },
      relations: ['reservas', 'reservas.aluno']
    });
    
    if (!aula) {
      console.log('[cancelarReserva] Aula não encontrada');
      return res.status(404).json({ error: "Aula não encontrada" });
    }
    
    // Verificar se a reserva existe e pertence ao aluno
    const reservaIndex = aula.reservas?.findIndex(r => 
      r.telefone === telefone && r.status === 'ativa'
    );
    
    if (reservaIndex === undefined || reservaIndex === -1) {
      return res.status(404).json({ error: "Reserva não encontrada ou já cancelada" });
    }
    
    // Cancelar a reserva (marcar como cancelada)
    const reserva = aula.reservas[reservaIndex];
    reserva.status = 'cancelada';
    reserva.data_cancelamento = new Date();
    
    // Atualizar vagas ocupadas
    aula.vagas_ocupadas = Math.max(0, aula.vagas_ocupadas - 1);
    
    // Atualizar status da aula se necessário
    if (aula.vagas_ocupadas < aula.vagas_total && aula.status === StatusAula.LOTADA) {
      aula.status = StatusAula.DISPONIVEL;
    }
    
    await aulaRepository.save(aula);
    
    console.log('[cancelarReserva] Reserva cancelada com sucesso');
    res.json({ message: "Reserva cancelada com sucesso" });
  } catch (err: any) {
    console.log('[cancelarReserva] Erro:', err.message);
    res.status(500).json({ error: 'Erro ao cancelar reserva.' });
  }
};
