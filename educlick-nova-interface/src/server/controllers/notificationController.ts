import { Request, Response } from 'express';
import { AppDataSource } from '../../infrastructure/database/dataSource';
import { Usuario } from '../entities/Usuario';
import { NotificationService } from '../services/notificationService';

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
}
