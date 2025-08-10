import admin from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';

// Inicializa o Firebase Admin apenas se ainda não tiver sido inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('./serviceAccountKey.json'))
  });
}

export async function verificarTokenFirebase(
  req: Request & { cookies?: any; usuario?: any },
  res: Response,
  next: NextFunction
) {
  let token = null;

  // Captura o token do header Authorization ou dos cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Se não tiver token, envia erro
  if (!token) {
    res.status(401).json({ error: 'Token ausente ou malformado' });
    return;
  }

  try {
    // Verifica o token com o Firebase Admin
    const decoded = await admin.auth().verifyIdToken(token);
    req.usuario = decoded; // Armazena o usuário no request
    next(); // Passa para a próxima função da rota
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
}
