"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Professor = void 0;
const typeorm_1 = require("typeorm");
const Usuario_1 = require("./Usuario");
const Aula_1 = require("./Aula");
let Professor = class Professor {
};
exports.Professor = Professor;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Professor.prototype, "nome", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Professor.prototype, "telefone", void 0);
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Professor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Professor.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Usuario_1.Usuario, { nullable: false }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Usuario_1.Usuario)
], Professor.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Professor.prototype, "nome_personalizado", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Professor.prototype, "especialidade", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Professor.prototype, "formacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Professor.prototype, "experiencia", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, unique: true }),
    __metadata("design:type", String)
], Professor.prototype, "linkUnico", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Aula_1.Aula, aula => aula.professor),
    __metadata("design:type", Array)
], Professor.prototype, "aulas", void 0);
exports.Professor = Professor = __decorate([
    (0, typeorm_1.Entity)()
], Professor);
