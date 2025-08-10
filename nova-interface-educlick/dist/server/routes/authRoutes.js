"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/server/routes/authRoutes.ts
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
router.post('/login', asyncHandler(authController_1.login));
router.post('/firebase-login', asyncHandler(authController_1.loginWithUid));
router.post('/sincronizar-usuario', asyncHandler(authController_1.sincronizarUsuario));
exports.default = router;
