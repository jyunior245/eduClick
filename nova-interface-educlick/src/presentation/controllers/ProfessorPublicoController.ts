import { Request, Response } from 'express';
import { aulaRepository } from '../../infrastructure/repositories/singletons';
import { TypeORMProfessorRepository } from '../../infrastructure/repositories/TypeORMProfessorRepository';
import { AppDataSource } from '../../infrastructure/database/dataSource';
// Inicializa o DataSource se ainda não estiver inicializado
if (!AppDataSource.isInitialized) {
  AppDataSource.initialize().catch(err => {
    console.error('Erro ao inicializar o DataSource:', err);
  });
}
import { ProfessorService } from '../../domain/services/ProfessorService';
import { AulaService } from '../../domain/services/AulaService';

const typeormProfessorRepository = new TypeORMProfessorRepository(AppDataSource);
const professorService = new ProfessorService(typeormProfessorRepository);
const aulaService = new AulaService(aulaRepository);

export class ProfessorPublicoController {
  static async perfilPublico(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const professores = await professorService.listarTodos();
      const professor = professores.find(p => p.linkUnico === id);
      
      if (!professor) {
        return res.status(404).json({ error: "Professor não encontrado" });
      }
      
      // Buscar aulas disponíveis do professor
  const aulas = await aulaService.listarAulasDisponiveisPorProfessor(String(professor.id));
      
      res.json({
        professor: {
          id: professor.id,
          nome: professor.nome,
          especialidade: professor.especialidade,
          bio: professor.bio,
          telefone: professor.telefone,
          formacao: professor.formacao,
          experiencia: professor.experiencia,
          observacoes: professor.observacoes,
          descricao: professor.descricao,
          conteudosDominio: professor.conteudosDominio,
          fotoPerfil: professor.fotoPerfil
        },
        aulas: aulas
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async reservarAula(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { aulaId, alunoNome, alunoTelefone, alunoEmail } = req.body;
      // Validação de e-mail
      if (!alunoEmail || !/^\S+@\S+\.\S+$/.test(alunoEmail)) {
        return res.status(400).json({ error: 'E-mail do aluno é obrigatório e deve ser válido.' });
      }
      
      // Verificar se o professor existe
      const professores = await professorService.listarTodos();
      const professor = professores.find(p => p.linkUnico === id);
      console.log('[reservarAula] id param:', id);
      console.log('[reservarAula] professor encontrado:', professor);
      if (professor) {
        console.log('[reservarAula] professor.id:', professor.id, 'typeof:', typeof professor.id);
        console.log('[reservarAula] professor.linkUnico:', professor.linkUnico, 'typeof:', typeof professor.linkUnico);
      }
      
      if (!professor) {
        throw new Error(`[reservarAula] Professor não encontrado. id param: ${id}, professores: ${JSON.stringify(professores)}`);
      }
      
      // Verificar se a aula pertence ao professor
      const aula = await aulaService.buscarAulaPorId(aulaId);
      console.log('[reservarAula] aulaId:', aulaId);
      console.log('[reservarAula] aula encontrada:', aula);
      if (aula) {
        console.log('[reservarAula] aula.professorId:', aula.professorId, 'typeof:', typeof aula.professorId);
        console.log('[reservarAula] aula.professorId === professor.id:', aula && professor ? String(aula.professorId) === String(professor.id) : 'n/a');
      }
      if (!aula) {
        throw new Error(`[reservarAula] Aula não encontrada. aulaId: ${aulaId}`);
      }
      if (String(aula.professorId).trim() !== String(professor.id).trim()) {
        throw new Error(`[reservarAula] Divergência de IDs. aula.professorId: ${aula.professorId} (${typeof aula.professorId}), professor.id: ${professor.id} (${typeof professor.id})`);
      }
      
      // Tentar reservar a aula
      const reservada = await aulaService.reservarAula(aulaId, alunoNome, alunoTelefone, alunoEmail);
      
      if (reservada) {
        res.json({ 
          message: "Aula reservada com sucesso",
          aula: {
            id: aula.id,
            titulo: aula.titulo,
            dataHora: aula.dataHora,
            valor: aula.valorFormatado,
            duracao: aula.duracaoFormatada
          }
        });
      } else {
        res.status(400).json({ error: "Não foi possível reservar a aula" });
      }
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async listarAgendamentosAluno(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nome, telefone, email } = req.query;
      
      console.log('[listarAgendamentosAluno] Parâmetros recebidos:', { id, nome, telefone, email });
      
      // Validação dos parâmetros obrigatórios
      if (!nome || !telefone || !email) {
        return res.status(400).json({ 
          error: "Parâmetros obrigatórios: nome, telefone e email são necessários" 
        });
      }
      
      // Buscar professor pelo linkUnico ou id
      const professores = await professorService.listarTodos();
      console.log('[listarAgendamentosAluno] Total de professores:', professores.length);
      
  const professor = professores.find(p => p.linkUnico === id || String(p.id) === id);
      console.log('[listarAgendamentosAluno] Professor encontrado:', professor ? { id: professor.id, nome: professor.nome } : 'não encontrado');
      
      if (!professor) {
        return res.status(404).json({ error: "Professor não encontrado" });
      }
      
      // Buscar aulas do professor pelo UUID
  const aulas = await aulaService.listarAulasPorProfessor(String(professor.id));
      console.log('[listarAgendamentosAluno] Aulas encontradas via serviço:', aulas.length);
      
      // Teste alternativo: buscar diretamente do repositório
      const todasAulas = await aulaRepository.listarTodos();
      console.log('[listarAgendamentosAluno] Total de aulas no repositório:', todasAulas.length);
      
  const aulasDiretas = todasAulas.filter(a => String(a.professorId) === String(professor.id));
      console.log('[listarAgendamentosAluno] Aulas encontradas via repositório direto:', aulasDiretas.length);
      
      // Log detalhado das aulas para debug
      todasAulas.forEach((aula, idx) => {
        console.log(`[listarAgendamentosAluno] Aula ${idx + 1}: professorId=${aula.professorId} (${typeof aula.professorId}), professor.id=${professor.id} (${typeof professor.id}), match=${String(aula.professorId) === String(professor.id)}`);
      });
      
      console.log(`[listarAgendamentosAluno] Professor id: ${professor.id}, aulas encontradas: ${aulas.length}`);
      
      // Log detalhado das aulas e suas reservas
      aulas.forEach((aula: any, idx: number) => {
        console.log(`[listarAgendamentosAluno] Aula ${idx + 1} (${aula.id}): reservas =`, aula.reservas);
      });
      
      // Filtrar reservas do aluno
      const agendamentos = aulas.flatMap((aula: any) => {
        return (aula.reservas || []).filter((reserva: any) => {
          // Logar cada reserva
          console.log('[listarAgendamentosAluno] Reserva encontrada:', reserva);
          
          // Função para normalizar telefone (remover máscara, espaços, etc)
          const normalizePhone = (t: string) => t.replace(/\D/g, '');
          
          const matchTelefone = telefone ? normalizePhone(reserva.telefone) === normalizePhone(String(telefone)) : true;
          const matchNome = nome ? reserva.nome.trim().toLowerCase() === String(nome).trim().toLowerCase() : true;
          const matchEmail = email ? reserva.email.trim().toLowerCase() === String(email).trim().toLowerCase() : true;
          
          const result = matchTelefone && matchNome && matchEmail;
          
          if (result) {
            console.log('[listarAgendamentosAluno] Reserva corresponde ao filtro:', reserva);
          }
          
          return result;
        }).map((reserva: any) => ({
          id: aula.id,
          titulo: aula.titulo,
          conteudo: aula.conteudo,
          dataHora: aula.dataHora,
          status: reserva.status || aula.status,
          statusAula: aula.status,
          professorNome: professor.nome,
          professorEmail: '', // email não existe mais em Professor
          professorTelefone: professor.telefone,
          nome: reserva.nome,
          telefone: reserva.telefone,
          email: reserva.email
        }));
      });
      
      console.log('[listarAgendamentosAluno] Agendamentos retornados:', agendamentos);
      res.json(agendamentos);
      
    } catch (err: any) {
      console.error('[listarAgendamentosAluno] Erro:', err);
      res.status(500).json({ error: `Erro interno do servidor: ${err.message}` });
    }
  }
} 