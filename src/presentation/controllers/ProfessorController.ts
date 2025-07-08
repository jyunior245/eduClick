/// <reference types="express-session" />
import { Request, Response } from "express";
import { professorRepository, alunoRepository, aulaRepository } from "../../infrastructure/repositories/singletons";
import { AuthService } from "../../domain/services/AuthService";
import { ProfessorService } from "../../domain/services/ProfessorService";
import { Professor } from "../../core/entities/Professor";
import { v4 as uuidv4 } from "uuid";

const authService = new AuthService(professorRepository, alunoRepository);
const professorService = new ProfessorService(professorRepository);

export class ProfessorController {
  static async cadastrar(req: Request, res: Response) {
    try {
      const { nome, email, senha, descricao, conteudosDominio } = req.body;
      
      const professor = new Professor(
        uuidv4(),
        nome,
        email,
        senha,
        undefined, // fotoPerfil
        descricao,
        conteudosDominio || []
      );
      
      // Gerar link único automaticamente
      professor.gerarLinkUnico();
      
      await authService.registrar(professor);
      res.status(201).json({ 
        message: "Professor cadastrado com sucesso",
        linkUnico: professor.linkUnico
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;
      const professor = await authService.login(email, senha) as Professor;
      
      req.session.professorId = professor.id;
      res.json({ 
        id: professor.id, 
        nome: professor.nome, 
        email: professor.email,
        linkUnico: professor.linkUnico
      });
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  }

  static async perfil(req: Request, res: Response) {
    try {
      const professorId = req.session.professorId;
      if (!professorId) return res.status(401).json({ error: "Não autenticado" });
      
      const professor = await professorService.buscarPorId(professorId);
      if (!professor) return res.status(404).json({ error: "Professor não encontrado" });
      
      res.json({
        ...professor,
        linkPublico: professor.getLinkPublico()
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async atualizarPerfil(req: Request, res: Response) {
    try {
      const professorId = req.session.professorId;
      if (!professorId) return res.status(401).json({ error: "Não autenticado" });
      
      // Adicionar todos os campos possíveis do professor
      const { nome, email, descricao, conteudosDominio, fotoPerfil, telefone, formacao, experiencia } = req.body;
      
      const professor = await professorService.atualizarPerfil(professorId, {
        nome,
        email,
        descricao,
        conteudosDominio,
        fotoPerfil,
        telefone,
        formacao,
        experiencia
      });
      
      res.json({
        ...professor,
        linkPublico: professor.getLinkPublico()
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async gerarLinkUnico(req: Request, res: Response) {
    try {
      const professorId = req.session.professorId;
      if (!professorId) return res.status(401).json({ error: "Não autenticado" });
      
      const professor = await professorService.buscarPorId(professorId);
      if (!professor) return res.status(404).json({ error: "Professor não encontrado" });
      
      const linkUnico = professor.gerarLinkUnico();
      await professorRepository.salvar(professor);
      
      res.json({ 
        linkUnico,
        linkPublico: professor.getLinkPublico()
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async listarAgendamentos(req: Request, res: Response) {
    try {
      const professorId = req.session.professorId;
      if (!professorId) return res.status(401).json({ error: "Não autenticado" });
      // Buscar aulas do professor
      const aulas = await aulaRepository.buscarPorProfessor(professorId);
      // Extrair reservas de cada aula, incluindo nome e telefone do aluno
      const agendamentos = aulas.flatMap((aula: any) =>
        (aula.reservas || []).map((reserva: any) => ({
          id: aula.id,
          nome: reserva.nome,
          telefone: reserva.telefone,
          dataHora: aula.dataHora,
          status: aula.status
        }))
      );
      res.json(agendamentos);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async listarAulasPublicas(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // Buscar professor por linkUnico ou id
      const professores = await professorService.listarTodos();
      const professor = professores.find(p => p.linkUnico === id || p.id === id);
      if (!professor) {
        return res.status(404).json({ error: "Professor não encontrado" });
      }
      const aulas = await aulaRepository.buscarPorProfessor(professor.id);
      // Filtrar apenas aulas disponíveis
      const aulasDisponiveis = aulas.filter((a: any) => a.status === 'disponivel');
      res.json(aulasDisponiveis);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async buscarPorIdPublico(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Buscar professor por link único ou ID
      const professores = await professorService.listarTodos();
      const professor = professores.find(p => p.linkUnico === id || p.id === id);
      
      if (!professor) {
        return res.status(404).json({ error: "Professor não encontrado" });
      }
      
      // Retornar informações públicas ampliadas
      res.json({
        id: professor.id,
        nome: professor.nome,
        email: professor.email,
        descricao: professor.descricao,
        conteudosDominio: professor.conteudosDominio,
        fotoPerfil: professor.fotoPerfil,
        linkUnico: professor.linkUnico,
        formacao: professor.formacao || '',
        experiencia: professor.experiencia || '',
        telefone: professor.telefone || ''
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
} 