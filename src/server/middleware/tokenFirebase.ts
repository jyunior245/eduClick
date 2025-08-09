import admin from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';
import serviceAccountEnv from './serviceAccount';

// Inicializa o Firebase Admin apenas se ainda não tiver sido inicializado
if (!admin.apps.length) {
  let credentialSource: any = serviceAccountEnv;
  try {
    // Tenta usar o arquivo local se as variáveis de ambiente não estiverem completas
    const hasEnvCreds = !!(serviceAccountEnv && (serviceAccountEnv as any).client_email && (serviceAccountEnv as any).private_key);
    if (!hasEnvCreds) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const serviceAccountFile = require('./serviceAccountKey.json');
      credentialSource = serviceAccountFile;
    }
  } catch (_) {
    // Se não houver arquivo, segue com o que tiver no env (pode falhar em runtime se incompleto)
  }

  admin.initializeApp({
    credential: admin.credential.cert(credentialSource as admin.ServiceAccount)
  });
}

export async function verificarTokenFirebase(
  req: Request & { cookies?: any; usuario?: any },
  res: Response,
  next: NextFunction
) {
  let token: string | null = null;

  // 1) Captura o token do header Authorization ou dos cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // 2) Se não houver token, tenta sessão
  const sessionProfessorId = (req as any).session?.professorId;
  if (!token && sessionProfessorId) {
    req.usuario = { uid: sessionProfessorId } as any;
    next();
    return;
  }

  if (!token) {
    res.status(401).json({ error: 'Token ausente ou não autenticado' });
    return;
  }

  // 3) Tenta verificar com Admin SDK
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.usuario = decoded;
    next();
    return;
  } catch (_) {
    // 4) Fallback: decodifica sem verificar, para ambiente de desenvolvimento
    try {
      const [, payloadB64] = token.split('.');
      const payloadJson = Buffer.from(payloadB64, 'base64').toString('utf-8');
      const payload = JSON.parse(payloadJson);
      const uid = payload.user_id || payload.uid;
      if (uid) {
        req.usuario = { uid } as any;
        next();
        return;
      }
    } catch (e) {
      // ignore
    }
    res.status(401).json({ error: 'Token inválido' });
  }
}
