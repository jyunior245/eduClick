"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificarTokenFirebase = verificarTokenFirebase;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
// Inicializa o Firebase Admin apenas se ainda não tiver sido inicializado
if (!firebase_admin_1.default.apps.length) {
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert(require('./serviceAccountKey.json'))
    });
}
function verificarTokenFirebase(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let token = null;
        // Captura o token do header Authorization ou dos cookies
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        // Se não tiver token, envia erro
        if (!token) {
            res.status(401).json({ error: 'Token ausente ou malformado' });
            return;
        }
        try {
            // Verifica o token com o Firebase Admin
            const decoded = yield firebase_admin_1.default.auth().verifyIdToken(token);
            req.usuario = decoded; // Armazena o usuário no request
            next(); // Passa para a próxima função da rota
        }
        catch (err) {
            res.status(401).json({ error: 'Token inválido' });
        }
    });
}
