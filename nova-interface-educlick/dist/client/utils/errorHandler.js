"use strict";
// Sistema centralizado de tratamento de erros
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = exports.AppError = void 0;
const logger_1 = require("./logger");
const Toast_1 = require("../components/Toast");
class AppError extends Error {
    constructor(message, code, statusCode, isOperational = true) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
class ErrorHandler {
    static handle(error, context) {
        const errorMessage = context ? `${context}: ${error.message}` : error.message;
        if (error instanceof AppError && error.isOperational) {
            logger_1.logger.warn(errorMessage);
            (0, Toast_1.mostrarToast)(error.message, 'danger');
        }
        else {
            logger_1.logger.error(errorMessage, error);
            (0, Toast_1.mostrarToast)('Ocorreu um erro inesperado. Tente novamente.', 'danger');
        }
    }
    static handleAsync(promise, context, fallback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield promise;
            }
            catch (error) {
                this.handle(error, context);
                return fallback;
            }
        });
    }
    static createOperationalError(message, code) {
        return new AppError(message, code);
    }
    static createSystemError(message, code) {
        return new AppError(message, code, undefined, false);
    }
}
exports.ErrorHandler = ErrorHandler;
