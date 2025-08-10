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
exports.Aula = exports.StatusAula = void 0;
const typeorm_1 = require("typeorm");
const Professor_1 = require("./Professor");
const Reserva_1 = require("./Reserva");
var StatusAula;
(function (StatusAula) {
    StatusAula["DISPONIVEL"] = "disponivel";
    StatusAula["LOTADA"] = "lotada";
    StatusAula["CANCELADA"] = "cancelada";
})(StatusAula || (exports.StatusAula = StatusAula = {}));
let Aula = class Aula {
};
exports.Aula = Aula;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Aula.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Professor_1.Professor, professor => professor.aulas, { nullable: false }),
    __metadata("design:type", Professor_1.Professor)
], Aula.prototype, "professor", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Aula.prototype, "titulo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Aula.prototype, "conteudo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', nullable: true }),
    __metadata("design:type", Number)
], Aula.prototype, "valor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Aula.prototype, "duracao", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], Aula.prototype, "vagas_total", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Aula.prototype, "vagas_ocupadas", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: StatusAula, default: StatusAula.DISPONIVEL }),
    __metadata("design:type", String)
], Aula.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: false }),
    __metadata("design:type", Date)
], Aula.prototype, "data_hora", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Reserva_1.Reserva, reserva => reserva.aula),
    __metadata("design:type", Array)
], Aula.prototype, "reservas", void 0);
exports.Aula = Aula = __decorate([
    (0, typeorm_1.Entity)()
], Aula);
