import { Request, Response } from "express";
import { AuthService } from "../../domain/services/AuthService";
import { Usuario } from "../../core/entities/Usuario";
import { Professor } from "../../core/entities/Professor";
import { Aluno } from "../../core/entities/Aluno";
import { professorRepository, alunoRepository } from '../../infrastructure/repositories/singletons';
import { FirebaseAuthProvider } from "../../infrastructure/auth/LocalAuthProvider";

const authService = new AuthService(professorRepository, alunoRepository);
const authProvider = new FirebaseAuthProvider();

export class AuthController {
  static async registrar(req: Request, res: Response): Promise<void> {
  try {
    const { nome, email, senha, tipo, telefone, descricao, conteudosDominio } = req.body;

    if (tipo === "PROFESSOR") {
      // Cria usuário no Firebase
      const usuarioFirebase = await authProvider.registrar({ nome, email, senha });

      // Cria objeto Professor com o usuário Firebase e props extras
      const professor = new Professor(usuarioFirebase, { descricao, conteudosDominio: conteudosDominio || [] });

      // Salvar professor no repositório (via seu service)
      await authService.registrarProfessor({
        nome,
        email,
        senha,
        descricao,
        conteudosDominio
      });

      res.status(201).json({ message: "Professor registrado com sucesso", id: professor.id });
    } else {
      // Similar para Aluno...
    }
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, senha } = req.body;
      const usuario = await authService.login(email, senha);
      
      // Definir tipo baseado na instância
      const tipo = usuario instanceof Professor ? 'PROFESSOR' : 'ALUNO';
      
      (req.session as any).usuario = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: tipo
      };
      // Compatibilidade: se for professor, setar também req.session.professorId
      if (tipo === 'PROFESSOR') {
        req.session.professorId = usuario.id;
      }
      
      console.log('Sessão após login:', (req.session as any).usuario);
      res.status(200).json((req.session as any).usuario);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    try {
      await authService.logout();
      (req.session as any).destroy(() => {});
      res.status(200).json({ message: "Logout realizado com sucesso" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async loginProfessor(req: Request, res: Response): Promise<void> {
    try {
      const { email, senha } = req.body;
      const usuario = await authService.login(email, senha);
      
      if (!(usuario instanceof Professor)) {
        throw new Error("Credenciais inválidas para professor");
      }
      
      (req.session as any).usuario = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: 'PROFESSOR'
      };
      
      res.status(200).json((req.session as any).usuario);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  static async loginAluno(req: Request, res: Response): Promise<void> {
    try {
      const { email, senha } = req.body;
      const usuario = await authService.login(email, senha);
      
      if (!(usuario instanceof Aluno)) {
        throw new Error("Credenciais inválidas para aluno");
      }
      
      (req.session as any).usuario = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: 'ALUNO'
      };
      
      res.status(200).json((req.session as any).usuario);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  static async checkSession(req: Request, res: Response): Promise<void> {
    try {
      const usuario = (req.session as any).usuario;
      if (usuario) {
        res.status(200).json(usuario);
      } else {
        res.status(401).json({ error: "Usuário não autenticado" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}