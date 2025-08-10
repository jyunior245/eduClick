"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.requireAuth = requireAuth;
// Middleware de tratamento de erros
function errorHandler(err, req, res, next) {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Erro interno do servidor.' });
}
// Middleware de autenticação (exemplo)
function requireAuth(req, res, next) {
    // Implemente a lógica de autenticação aqui
    next();
}
