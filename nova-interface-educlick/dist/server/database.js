"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const path_1 = __importDefault(require("path"));
// Detecta se está rodando em produção (build) ou desenvolvimento
const isProd = __dirname.includes('dist');
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '12345',
    database: 'educlick',
    entities: [
        isProd
            ? path_1.default.join(__dirname, 'entities', '*.js')
            : path_1.default.join(__dirname, 'entities', '*.ts')
    ],
    synchronize: true,
});
