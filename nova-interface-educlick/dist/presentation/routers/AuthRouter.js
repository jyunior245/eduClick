"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const router = (0, express_1.Router)();
// Login de professor
router.post('/login/professor', AuthController_1.AuthController.loginProfessor);
// Login de aluno
router.post('/login/aluno', AuthController_1.AuthController.loginAluno);
// Logout
router.post('/logout', AuthController_1.AuthController.logout);
// Verificar sessão
router.get('/session', AuthController_1.AuthController.checkSession);
exports.default = router;
