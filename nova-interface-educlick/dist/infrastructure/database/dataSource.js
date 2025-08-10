"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const Professor_1 = require("../../core/entities/Professor");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'sua_senha', // Troque pela senha correta
    database: 'educlick',
    entities: [Professor_1.Professor],
    synchronize: false, // Use migrations em produção
});
