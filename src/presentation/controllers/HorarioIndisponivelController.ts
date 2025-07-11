import { Request, Response } from "express";
import { horarioIndisponivelRepository } from "../../infrastructure/repositories/singletons";
import { HorarioIndisponivelService } from "../../domain/services/HorarioIndisponivelService";
import { HorarioIndisponivel } from "../../core/entities/HorarioIndisponivel";
import { v4 as uuidv4 } from "uuid";

const horarioService = new HorarioIndisponivelService(horarioIndisponivelRepository);

export class HorarioIndisponivelController {
  static async criar(req: Request, res: Response) {
    try {
      const professorId = req.session.professorId;
      if (!professorId) return res.status(401).json({ error: "Não autenticado" });
      const { dataInicio, dataFim, motivo } = req.body;
      const horario = new HorarioIndisponivel(
        uuidv4(),
        professorId,
        new Date(dataInicio),
        new Date(dataFim),
        motivo
      );
      await horarioService.criar(horario);
      res.status(201).json({ message: "Horário indisponível cadastrado" });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async listarPorProfessor(req: Request, res: Response) {
    try {
      const { professorId } = req.params;
      const horarios = await horarioService.listarPorProfessor(professorId);
      res.json(horarios);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async remover(req: Request, res: Response) {
    try {
      const professorId = req.session.professorId;
      if (!professorId) return res.status(401).json({ error: "Não autenticado" });
      const { id } = req.params;
      await horarioService.remover(id);
      res.json({ message: "Horário removido" });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async listarDoProfessorAutenticado(req: Request, res: Response) {
    try {
      const professorId = req.session.professorId;
      if (!professorId) return res.status(401).json({ error: "Não autenticado" });
      const horarios = await horarioService.listarPorProfessor(professorId);
      res.json(horarios);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
} 