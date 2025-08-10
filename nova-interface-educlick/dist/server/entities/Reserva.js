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
exports.Reserva = void 0;
const typeorm_1 = require("typeorm");
const Aula_1 = require("./Aula");
const Aluno_1 = require("./Aluno");
let Reserva = class Reserva {
};
exports.Reserva = Reserva;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Reserva.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Aula_1.Aula, aula => aula.reservas),
    __metadata("design:type", Aula_1.Aula)
], Reserva.prototype, "aula", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Aluno_1.Aluno, aluno => aluno.reservas),
    __metadata("design:type", Aluno_1.Aluno)
], Reserva.prototype, "aluno", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Reserva.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Reserva.prototype, "data_reserva", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Reserva.prototype, "data_cancelamento", void 0);
exports.Reserva = Reserva = __decorate([
    (0, typeorm_1.Entity)()
], Reserva);
