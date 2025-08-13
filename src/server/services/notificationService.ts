import admin from 'firebase-admin';
import { AppDataSource } from '../../infrastructure/database/dataSource';
import { Aula } from '../entities/Aula';
import { Reserva } from '../entities/Reserva';
import { Usuario } from '../entities/Usuario';

// Initialize Firebase Admin if not already initialized
(function ensureFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      const gac = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      if (gac) {
        // Use JSON file via GOOGLE_APPLICATION_CREDENTIALS
        const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          ...(storageBucket ? { storageBucket } : {})
        } as any);
        console.log('[NotificationService] Firebase Admin initialized via GOOGLE_APPLICATION_CREDENTIALS');
        return;
      }

      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const rawKey = process.env.FIREBASE_PRIVATE_KEY || '';
      const privateKey = rawKey.replace(/\\n/g, '\n');

      if (!projectId || !clientEmail || !privateKey) {
        console.warn('[NotificationService] Firebase Admin env vars missing (FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY).');
        return;
      }
      const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
        ...(storageBucket ? { storageBucket } : {})
      } as any);
      console.log('[NotificationService] Firebase Admin initialized via env vars');
    } catch (e) {
      console.error('[NotificationService] Failed to initialize Firebase Admin:', e);
    }
  }
})();

export class NotificationService {
  static async sendToFcmToken(token: string, title: string, body: string, data: Record<string, string> = {}) {
    try {
      if (!token) return;
      const messageId = await admin.messaging().send({
        token,
        notification: { title, body },
        data,
      });
      console.log('[NotificationService] sendToFcmToken OK messageId:', messageId);
    } catch (e) {
      console.error('[NotificationService] sendToFcmToken error:', e);
    }
  }

  static async sendToUsuarioUid(uid: string, title: string, body: string, data: Record<string, string> = {}) {
    try {
      const repo = AppDataSource.getRepository(Usuario);
      console.log('[NotificationService] sendToUsuarioUid: buscando usuário por uid:', uid);
      const usuario = await repo.findOne({ where: { uid } });
      if (!usuario) {
        console.warn('[NotificationService] sendToUsuarioUid: usuário não encontrado para uid:', uid);
        return;
      }
      if (!usuario.fcmToken) {
        console.warn('[NotificationService] sendToUsuarioUid: usuário sem fcmToken. uid:', uid);
        return;
      }
      console.log('[NotificationService] Enviando push para uid:', uid, 'token (parcial):', (usuario.fcmToken || '').slice(0, 12) + '...');
      await this.sendToFcmToken(usuario.fcmToken, title, body, data);
    } catch (e) {
      console.error('[NotificationService] sendToUsuarioUid error:', e);
    }
  }

  // Run every minute: send reminders 30 minutes before class start
  static async enviarLembretesAulas() {
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 60 * 1000);
    const in31 = new Date(now.getTime() + 31 * 60 * 1000);
    console.log('[NotificationService] executar enviarLembretesAulas', { now, in30, in31 });

    const aulaRepo = AppDataSource.getRepository(Aula);
    const reservaRepo = AppDataSource.getRepository(Reserva);

    // Find aulas starting around 30 minutes from now
    const aulas = await aulaRepo
      .createQueryBuilder('a')
      .where('a.data_hora BETWEEN :in30 AND :in31', { in30, in31 })
      .getMany();

    if (!aulas.length) {
      console.log('[NotificationService] enviarLembretesAulas: nenhuma aula no intervalo');
      return;
    }

    for (const aula of aulas) {
      console.log('[NotificationService] lembretes para aula', { aulaId: aula.id, titulo: aula.titulo, data_hora: aula.data_hora });
      // Get active reservations without reminder sent
      const reservas = await reservaRepo
        .createQueryBuilder('r')
        .leftJoinAndSelect('r.aluno', 'aluno')
        .leftJoinAndSelect('aluno.usuario', 'usuario')
        .where('r.aulaId = :aulaId', { aulaId: aula.id })
        .andWhere('LOWER(r.status) = :st', { st: 'ativa' })
        .andWhere('(r.reminder_enviado = false OR r.reminder_enviado IS NULL)')
        .getMany();

      console.log('[NotificationService] reservas ativas sem lembrete', { aulaId: aula.id, count: reservas.length });
      for (const r of reservas) {
        const token = (r as any)?.aluno?.usuario?.fcmToken || (r as any)?.fcmToken;
        if (token) {
          console.log('[NotificationService] enviando lembrete para aluno', { reservaId: r.id, aulaId: aula.id });
          await this.sendToFcmToken(
            token,
            'Lembrete de aula',
            `Sua aula "${aula.titulo}" começa em 30 minutos`,
            { aulaId: String(aula.id) }
          );
        }
        // mark as sent
        r.reminder_enviado = true;
        await reservaRepo.save(r);
      }
    }
  }

  // Notifica todos os alunos com reservas ativas quando a aula é reagendada
  static async notificarAulaReagendada(aulaId: number, novaDataHora: Date) {
    try {
      const aulaRepo = AppDataSource.getRepository(Aula);
      const reservaRepo = AppDataSource.getRepository(Reserva);
      const aula = await aulaRepo.findOne({ where: { id: aulaId } });
      if (!aula) {
        console.warn('[NotificationService] notificarAulaReagendada: aula não encontrada', { aulaId });
        return;
      }

      const reservas = await reservaRepo
        .createQueryBuilder('r')
        .leftJoinAndSelect('r.aluno', 'aluno')
        .leftJoinAndSelect('aluno.usuario', 'usuario')
        .where('r.aulaId = :aulaId', { aulaId })
        .andWhere('LOWER(r.status) = :st', { st: 'ativa' })
        .getMany();

      if (!reservas.length) {
        console.log('[NotificationService] notificarAulaReagendada: sem reservas ativas', { aulaId });
        return;
      }

      const dt = novaDataHora instanceof Date ? novaDataHora : new Date(novaDataHora);
      const horaLocal = isNaN(dt.getTime()) ? '' : dt.toLocaleString();
      const dtIso = isNaN(dt.getTime()) ? undefined : dt.toISOString();
      for (const r of reservas) {
        const token = (r as any)?.aluno?.usuario?.fcmToken || (r as any)?.fcmToken;
        if (token) {
          await this.sendToFcmToken(
            token,
            'Aula reagendada',
            `Sua aula "${aula.titulo}" foi reagendada para ${horaLocal}`,
            { type: 'AULA_REAGENDADA', aulaId: String(aulaId), novaDataHora: dtIso || '' }
          );
        }
      }
      console.log('[NotificationService] notificarAulaReagendada: notificações enviadas', { aulaId, count: reservas.length });
    } catch (e) {
      console.error('[NotificationService] notificarAulaReagendada error:', e);
    }
  }

  // Notifica alunos e professor quando a aula é cancelada e dispara AULAS_UPDATED
  static async notificarAulaCancelada(aulaId: number) {
    try {
      const aulaRepo = AppDataSource.getRepository(Aula);
      const reservaRepo = AppDataSource.getRepository(Reserva);
      const aula = await aulaRepo.findOne({ where: { id: aulaId }, relations: ['professor', 'professor.usuario'] });
      if (!aula) {
        console.warn('[NotificationService] notificarAulaCancelada: aula não encontrado', { aulaId });
        return;
      }

      const reservas = await reservaRepo
        .createQueryBuilder('r')
        .leftJoinAndSelect('r.aluno', 'aluno')
        .leftJoinAndSelect('aluno.usuario', 'usuario')
        .where('r.aulaId = :aulaId', { aulaId })
        .andWhere('LOWER(r.status) = :st', { st: 'ativa' })
        .getMany();

      // Notificar alunos
      for (const r of reservas) {
        const token = (r as any)?.aluno?.usuario?.fcmToken || (r as any)?.fcmToken;
        if (token) {
          await this.sendToFcmToken(
            token,
            'Aula cancelada',
            `Sua aula "${aula.titulo}" foi cancelada`,
            { type: 'AULAS_UPDATED', aulaId: String(aulaId) }
          );
        }
      }

      // Notificar professor para atualizar dashboard
      try {
        const profUid = (aula as any)?.professor?.usuario?.uid;
        if (profUid) {
          await this.sendToUsuarioUid(
            profUid,
            'Aula cancelada',
            `A aula "${aula.titulo}" foi cancelada`,
            { type: 'AULAS_UPDATED', aulaId: String(aulaId) }
          );
        }
      } catch (e) {
        console.warn('[NotificationService] notificarAulaCancelada: falha ao notificar professor', e);
      }

      console.log('[NotificationService] notificarAulaCancelada: notificações enviadas', { aulaId, count: reservas.length });
    } catch (e) {
      console.error('[NotificationService] notificarAulaCancelada error:', e);
    }
  }
}
