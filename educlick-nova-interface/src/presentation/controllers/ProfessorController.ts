/// <reference types="express-session" />
import { Request, Response } from "express";
import { DecodedIdToken } from "firebase-admin/auth";
import { professorRepository, alunoRepository, aulaRepository } from "../../infrastructure/repositories/singletons";
import { AuthService } from "../../domain/services/AuthService";
import { ProfessorService } from "../../domain/services/ProfessorService";
import { Professor } from "../../core/entities/Professor";
import { v4 as uuidv4 } from "uuid";

// Tipo extendido para suportar usuario (token Firebase)
interface RequestComUsuario extends Request {
  usuario?: DecodedIdToken;
}

const authService = new AuthService(professorRepository, alunoRepository);
const professorService = new ProfessorService(professorRepository);

export class ProfessorController {
  static async cadastrar(req: Request, res: Response) {
    try {
      const { nome, email, senha, descricao, conteudosDominio } = req.body;

      await authService.registrarProfessor({
        nome,
        email,
        senha,
        descricao,
        conteudosDominio,
      });

      res.status(201).json({
        message: "Professor cadastrado com sucesso"
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;
      const professor = await authService.login(email, senha) as Professor;

      // Para compatibilidade com sessões, mas o token Firebase será usado para autenticação
  req.session.professorId = String(professor.id);
      res.json({ 
  id: professor.id, 
  nome: professor.nome, 
  email: '',
  linkUnico: professor.linkUnico
      });
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  }

  static async perfil(req: RequestComUsuario, res: Response) {
    try {
      const professorId = req.usuario?.uid;
      if (!professorId) return res.status(401).json({ error: "Não autenticado" });

      let professor = await professorService.buscarPorId(professorId);
      
      // Se o professor não existe, criar um novo com os dados do Firebase
      if (!professor) {
        const firebaseUser = {
          uid: professorId,
          displayName: req.usuario?.name || req.usuario?.displayName || 'Professor',
          email: req.usuario?.email || ''
        };
        
  professor = new Professor();
  professor.nomePersonalizado = req.usuario?.name || req.usuario?.displayName || 'Professor';
        await professorRepository.salvar(professor);
      }

      console.log('Professor retornado para o frontend:', {
        id: professor.id,
        nome: professor.nome,
        nomePersonalizado: (professor as any).nomePersonalizado,
        telefone: professor.telefone,
        especialidade: professor.especialidade,
        formacao: professor.formacao,
        experiencia: professor.experiencia,
        linkUnico: professor.linkUnico
      });
      
      res.json({
  ...professor,
  linkPublico: professor.linkUnico ? `/professor/${professor.linkUnico}` : ''
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async atualizarPerfil(req: RequestComUsuario, res: Response) {
    try {
      const professorId = req.usuario?.uid;
      if (!professorId) return res.status(401).json({ error: "Não autenticado" });

      console.log('Dados recebidos:', req.body);

      const {
        nome, telefone, formacao, experiencia,
        especialidade, linkUnico
      } = req.body;

      // Buscar o professor atual
      const professor = await professorService.buscarPorId(professorId);
      if (!professor) return res.status(404).json({ error: "Professor não encontrado" });

      // Atualizar apenas os campos permitidos
      const dadosAtualizados: any = {};
      
      if (nome !== undefined) dadosAtualizados.nomePersonalizado = nome;
      if (telefone !== undefined) dadosAtualizados.telefone = telefone;
      if (formacao !== undefined) dadosAtualizados.formacao = formacao;
      if (experiencia !== undefined) dadosAtualizados.experiencia = experiencia;
      if (especialidade !== undefined) dadosAtualizados.especialidade = especialidade;
      if (linkUnico !== undefined) dadosAtualizados.linkUnico = linkUnico;

      console.log('Dados a serem atualizados:', dadosAtualizados);

      const professorAtualizado = await professorService.atualizarPerfil(professorId, dadosAtualizados);

      res.json({
  ...professorAtualizado,
  linkPublico: professorAtualizado.linkUnico ? `/professor/${professorAtualizado.linkUnico}` : ''
      });
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err);
      res.status(400).json({ error: err.message });
    }
  }

  static async gerarLinkUnico(req: RequestComUsuario, res: Response) {
    try {
      const professorId = req.usuario?.uid;
      if (!professorId) return res.status(401).json({ error: "Não autenticado" });

      const professor = await professorService.buscarPorId(professorId);
      if (!professor) return res.status(404).json({ error: "Professor não encontrado" });

      // Gera linkUnico manualmente
      professor.linkUnico = `prof-${professor.id}`;
      await professorRepository.salvar(professor);

      res.json({
        linkUnico: professor.linkUnico,
        linkPublico: `/professor/${professor.linkUnico}`
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async listarAgendamentos(req: RequestComUsuario, res: Response) {
    try {
      const professorId = req.usuario?.uid;
      if (!professorId) return res.status(401).json({ error: "Não autenticado" });

      const aulas = await aulaRepository.buscarPorProfessor(professorId);
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
      const professores = await professorService.listarTodos();
      let professor = professores.find(p => p.linkUnico === id || String(p.id) === id);
      if (!professor) {
        return res.status(404).json({ error: "Professor não encontrado" });
      }
      const aulas = await aulaRepository.buscarPorProfessor(String(professor.id));
      const aulasDisponiveis = aulas.filter((a: any) => a.status === 'disponivel');
      res.json(aulasDisponiveis);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async buscarPorIdPublico(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const professores = await professorService.listarTodos();
      let professor = professores.find(p => p.linkUnico === id || String(p.id) === id);
      if (!professor) {
        return res.status(404).json({ error: "Professor não encontrado" });
      }
      res.json({
        id: professor.id,
        nome: professor.nome,
        email: '',
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
