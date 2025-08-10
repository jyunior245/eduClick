"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logController_1 = require("../controllers/logController");
const router = (0, express_1.Router)();
router.post('/', logController_1.criarLog);
router.get('/', logController_1.listarLogs);
router.get('/:id', logController_1.buscarLog);
exports.default = router;
