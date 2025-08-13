import { Request, Response } from 'express';
import { AppDataSource } from '../../infrastructure/database/dataSource';
import { Usuario } from '../entities/Usuario';
import { NotificationService } from '../services/notificationService';
import { Professor } from '../entities/Professor';

export class NotificationController {
  static async registerToken(req: Request & { usuario?: any }, res: Response): Promise<void> {
    try {
      const uid = req.usuario?.uid;
      const { token } = req.body || {};
      if (!uid) { res.status(401).json({ error: 'Não autenticado' }); return; }
      if (!token) { res.status(400).json({ error: 'Token FCM é obrigatório' }); return; }

      const repo = AppDataSource.getRepository(Usuario);
      const user = await repo.findOne({ where: { uid } });
      if (!user) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }

      user.fcmToken = token;
      await repo.save(user);
      res.json({ ok: true });
      return;
    } catch (e: any) {
      console.error('[registerToken] erro:', e);
      res.status(500).json({ error: 'Erro interno' });
      return;
    }
  }

  static async sendTest(req: Request & { usuario?: any }, res: Response): Promise<void> {
    try {
      const uid = req.usuario?.uid;
      if (!uid) { res.status(401).json({ error: 'Não autenticado' }); return; }

      const repo = AppDataSource.getRepository(Usuario);
      const user = await repo.findOne({ where: { uid } });
      if (!user) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }
      if (!user.fcmToken) { res.status(400).json({ error: 'Usuário não possui fcmToken salvo' }); return; }

      await NotificationService.sendToFcmToken(
        user.fcmToken,
        'Teste de Push',
        'Esta é uma notificação de teste do EduClick',
        { tipo: 'teste' }
      );
      res.json({ ok: true });
      return;
    } catch (e) {
      console.error('[sendTest] erro:', e);
      res.status(500).json({ error: 'Erro ao enviar notificação de teste' });
      return;
    }
  }

  // Fallback: permite registrar token usando sessão (professorId) quando Firebase Auth não está presente
  static async registerTokenViaSession(req: Request & { usuario?: any; session?: any }, res: Response): Promise<void> {
    try {
      const { token } = (req.body || {}) as { token?: string };
      if (!token) { res.status(400).json({ error: 'Token FCM é obrigatório' }); return; }

      // 1) Se veio autenticado por Firebase, usa o mesmo fluxo
      const uid = (req as any)?.usuario?.uid as string | undefined;
      const usuarioRepo = AppDataSource.getRepository(Usuario);
      if (uid) {
        const user = await usuarioRepo.findOne({ where: { uid } });
        if (!user) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }
        user.fcmToken = token;
        await usuarioRepo.save(user);
        res.json({ ok: true, via: 'firebase' });
        return;
      }

      // 2) Caso contrário, tenta sessão (professorId)
      const professorIdRaw = (req as any)?.session?.professorId;
      if (!professorIdRaw) { res.status(401).json({ error: 'Não autenticado (sem Firebase UID e sem sessão de professor)' }); return; }
      const professorId = typeof professorIdRaw === 'string' ? parseInt(professorIdRaw, 10) : Number(professorIdRaw);
      if (!Number.isInteger(professorId) || professorId <= 0) { res.status(400).json({ error: 'professorId inválido na sessão' }); return; }

      const profRepo = AppDataSource.getRepository(Professor);
      const professor = await profRepo.findOne({ where: { id: professorId }, relations: ['usuario'] });
      if (!professor || !professor.usuario) { res.status(404).json({ error: 'Professor/Usuario não encontrado' }); return; }

      const usuario = professor.usuario;
      usuario.fcmToken = token;
      await usuarioRepo.save(usuario);
      res.json({ ok: true, via: 'session' });
      return;
    } catch (e) {
      console.error('[registerTokenViaSession] erro:', e);
      res.status(500).json({ error: 'Erro interno' });
      return;
    }
  }
}
