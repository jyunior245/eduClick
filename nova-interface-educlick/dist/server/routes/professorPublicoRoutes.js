"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const professorPublicoController_1 = require("../controllers/professorPublicoController");
const router = (0, express_1.Router)();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
router.get('/:linkUnico', asyncHandler(professorPublicoController_1.ProfessorPublicoController.perfilPublico));
exports.default = router;
