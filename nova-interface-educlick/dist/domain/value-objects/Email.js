"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Email = void 0;
class Email {
    constructor(email) {
        if (!this.validarEmail(email)) {
            throw new Error("Email inválido");
        }
        this.valor = email;
    }
    validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    getValor() {
        return this.valor;
    }
    equals(outroEmail) {
        return this.valor === outroEmail.valor;
    }
}
exports.Email = Email;
