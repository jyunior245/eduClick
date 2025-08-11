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
}
