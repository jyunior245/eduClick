"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
(0, globals_1.describe)('Teste de Sanidade', () => {
    (0, globals_1.it)('1 + 1 deve ser igual a 2', () => {
        (0, globals_1.expect)(1 + 1).toBe(2);
    });
});
