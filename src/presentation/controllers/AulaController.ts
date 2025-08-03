import { Request, Response } from 'express';
import { AulaService } from '../../domain/services/AulaService';
import { aulaRepository } from '../../infrastructure/repositories/singletons';
import { Aula } from '../../core/entities/Aula';
import { DecodedIdToken } from "firebase-admin/auth";

const aulaService = new AulaService(aulaRepository);

// Tipo extendido para suportar usuario (token Firebase)
interface RequestComUsuario extends Request {
  usuario?: DecodedIdToken;
}

export class AulaController {
  static async criar(req: RequestComUsuario, res: Response) {
    try {
      const { titulo, conteudo, valor, duracao, dataHora, observacoes, maxAlunos } = req.body;
      const professorId = req.usuario?.uid;
      console.log('[AulaController.criar] professorId do token:', professorId);
      if (!professorId) {
        return res.status(401).json({ error: "Não autenticado" });
      }
      const aula = new Aula(
        Date.now().toString(),
        professorId,
        titulo,
        conteudo,
        valor,
        duracao,
        new Date(dataHora),
        observacoes,
        maxAlunos || 1
      );
      console.log('[AulaController.criar] Aula criada:', {
        id: aula.id,
        professorId: aula.professorId,
        titulo: aula.titulo,
        conteudo: aula.conteudo,
        valor: aula.valor,
        duracao: aula.duracao,
        dataHora: aula.dataHora,
        observacoes: aula.observacoes,
        maxAlunos: aula.maxAlunos
      });
      await aulaService.criarAula(aula);
      res.status(201).json({ message: "Aula criada com sucesso", aula });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async listarDoProfessor(req: RequestComUsuario, res: Response) {
    try {
      const professorId = req.usuario?.uid;
      if (!professorId) return res.status(401).json({ error: "Não autenticado" });
      
      const aulas = await aulaService.listarAulasPorProfessor(professorId);
      res.json(aulas);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async listarDisponiveisPorProfessor(req: Request, res: Response) {
    try {
      const { professorId } = req.params;
      const aulas = await aulaService.listarAulasDisponiveisPorProfessor(professorId);
      res.json(aulas);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async reservar(req: Request, res: Response) {
    try {
      const { aulaId } = req.params;
      const { alunoNome, alunoTelefone } = req.body;
      if (!alunoNome || !alunoTelefone) {
        return res.status(400).json({ error: "Nome e telefone do aluno são obrigatórios" });
      }
      const reservada = await aulaService.reservarAula(aulaId, alunoNome, alunoTelefone, '');
      if (reservada) {
        res.json({ message: "Aula reservada com sucesso" });
      } else {
        res.status(400).json({ error: "Não foi possível reservar a aula" });
      }
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async cancelar(req: RequestComUsuario, res: Response) {
    try {
      const { aulaId } = req.params;
      const professorId = req.usuario?.uid;
      
      if (!professorId) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      await aulaService.cancelarAula(aulaId);
      res.json({ message: "Aula cancelada com sucesso" });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // Novos métodos para funcionalidades avançadas
  static async buscarPorId(req: RequestComUsuario, res: Response) {
    try {
      console.log('[AulaController.buscarPorId] Usuário:', req.usuario);
      const { aulaId } = req.params;
      const professorId = req.usuario?.uid;
      
      if (!professorId) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const aula = await aulaService.buscarAulaPorId(aulaId);
      if (!aula) {
        return res.status(404).json({ error: "Aula não encontrada" });
      }

      // Verificar se a aula pertence ao professor
      if (aula.professorId !== professorId) {
        return res.status(403).json({ error: "Acesso negado" });
      }

      res.json(aula);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async atualizar(req: RequestComUsuario, res: Response) {
    try {
      console.log('[AulaController.atualizar] Usuário:', req.usuario);
      const { aulaId } = req.params;
      const { titulo, conteudo, valor, duracao, dataHora, observacoes, maxAlunos, status } = req.body;
      const professorId = req.usuario?.uid;
      
      if (!professorId) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const aula = await aulaService.buscarAulaPorId(aulaId);
      if (!aula) {
        return res.status(404).json({ error: "Aula não encontrada" });
      }

      // Verificar se a aula pertence ao professor
      if (aula.professorId !== professorId) {
        return res.status(403).json({ error: "Acesso negado" });
      }

      if (dataHora) {
        const novaData = new Date(dataHora);
        if (isNaN(novaData.getTime())) {
          return res.status(400).json({ error: "Data/Hora inválida" });
        }
        aula.dataHora = novaData;
      }
      if (observacoes !== undefined) aula.observacoes = observacoes;
      if (maxAlunos !== undefined) aula.maxAlunos = maxAlunos;
      if (status) aula.status = status;

      await aulaService.atualizarAula(aula);
      res.json({ message: "Aula atualizada com sucesso", aula });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async excluir(req: RequestComUsuario, res: Response) {
    try {
      const { aulaId } = req.params;
      const professorId = req.usuario?.uid;
      
      if (!professorId) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const aula = await aulaService.buscarAulaPorId(aulaId);
      if (!aula) {
        return res.status(404).json({ error: "Aula não encontrada" });
      }

      // Verificar se a aula pertence ao professor
      if (aula.professorId !== professorId) {
        return res.status(403).json({ error: "Acesso negado" });
      }

      await aulaService.excluirAula(aulaId);
      res.json({ message: "Aula excluída com sucesso" });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async cancelarReserva(req: RequestComUsuario, res: Response) {
    try {
      console.log('[cancelarReserva] chamada recebida:', req.method, req.originalUrl);
      const { aulaId } = req.params;
      const { nome, telefone } = req.body;
      console.log('[cancelarReserva] params:', { aulaId });
      console.log('[cancelarReserva] body:', { nome, telefone });
      // Logar todos os IDs de aulas existentes para diagnóstico
      const todasAulas = await aulaService.listarTodasAulas();
      console.log('[cancelarReserva] Todas as aulas existentes:', todasAulas.map(a => a.id));
      const professorId = req.usuario?.uid;
      // Permitir cancelamento por aluno (sem autenticação de professor)
      const aula = await aulaService.buscarAulaPorId(aulaId);
      if (!aula) {
        console.log('[cancelarReserva] Aula não encontrada');
        return res.status(404).json({ error: "Aula não encontrada" });
      }
      // Se for professor autenticado, checar permissão
      if (professorId && aula.professorId !== professorId) {
        return res.status(403).json({ error: "Acesso negado" });
      }
      const cancelada = await aulaService.cancelarReserva(aulaId, nome, telefone);
      if (cancelada) {
        console.log('[cancelarReserva] Reserva cancelada com sucesso');
        res.json({ message: "Reserva cancelada com sucesso" });
      } else {
        console.log('[cancelarReserva] Não foi possível cancelar a reserva');
        res.status(400).json({ error: "Não foi possível cancelar a reserva" });
      }
    } catch (err: any) {
      console.log('[cancelarReserva] Erro:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  static async atualizarStatusAgendamento(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: 'Status é obrigatório' });
      const aula = await aulaService.buscarAulaPorId(id);
      if (!aula) return res.status(404).json({ error: 'Aula/agendamento não encontrado' });
      aula.status = status;
      await aulaService.atualizarAula(aula);
      res.json({ message: 'Status atualizado com sucesso', aula });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async reagendar(req: RequestComUsuario, res: Response) {
    try {
      const { aulaId } = req.params;
      const { novaDataHora } = req.body;
      const professorId = req.usuario?.uid;
      if (!professorId) return res.status(401).json({ error: "Não autenticado" });
      const aula = await aulaService.buscarAulaPorId(aulaId);
      if (!aula) return res.status(404).json({ error: "Aula não encontrada" });
      if (aula.professorId !== professorId) return res.status(403).json({ error: "Acesso negado" });
      const novaData = new Date(novaDataHora);
      if (isNaN(novaData.getTime())) return res.status(400).json({ error: "Data/Hora inválida" });
      const aulaReagendada = await aulaService.reagendarAula(aulaId, novaData);
      res.json({ message: "Aula reagendada com sucesso", aula: aulaReagendada });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
} 
