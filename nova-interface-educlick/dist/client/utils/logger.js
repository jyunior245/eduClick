"use strict";
// Sistema de logging para o frontend EduClick
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    constructor() {
        // Em produção, só mostrar WARN e ERROR
        this.level = process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG;
    }
    shouldLog(level) {
        return level >= this.level;
    }
    formatMessage(level, message, ...args) {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level}] ${message}`;
    }
    debug(message, ...args) {
        if (this.shouldLog(LogLevel.DEBUG)) {
            console.debug(this.formatMessage('DEBUG', message), ...args);
        }
    }
    info(message, ...args) {
        if (this.shouldLog(LogLevel.INFO)) {
            console.info(this.formatMessage('INFO', message), ...args);
        }
    }
    warn(message, ...args) {
        if (this.shouldLog(LogLevel.WARN)) {
            console.warn(this.formatMessage('WARN', message), ...args);
        }
    }
    error(message, ...args) {
        if (this.shouldLog(LogLevel.ERROR)) {
            console.error(this.formatMessage('ERROR', message), ...args);
        }
    }
}
exports.logger = new Logger();
