"use strict";
// Utilitários para otimização de performance
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
exports.PerformanceOptimizer = void 0;
class PerformanceOptimizer {
    /**
     * Carregamento lazy de módulos para melhorar performance inicial
     */
    static loadModule(moduleName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.loadedModules.has(moduleName)) {
                return Promise.resolve();
            }
            try {
                // Simular carregamento lazy (em produção, usar dynamic imports)
                this.loadedModules.add(moduleName);
                return Promise.resolve();
            }
            catch (error) {
                console.error(`Erro ao carregar módulo ${moduleName}:`, error);
                throw error;
            }
        });
    }
    /**
     * Debounce para evitar múltiplas chamadas desnecessárias
     */
    static debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }
    /**
     * Throttle para limitar frequência de execução
     */
    static throttle(func, limit) {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    /**
     * Verificar se o dispositivo é mobile para otimizações específicas
     */
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    /**
     * Verificar conexão lenta para aplicar otimizações
     */
    static isSlowConnection() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            return connection.effectiveType === 'slow-2g' ||
                connection.effectiveType === '2g' ||
                connection.effectiveType === '3g';
        }
        return false;
    }
    /**
     * Aplicar otimizações baseadas no dispositivo/conexão
     */
    static applyOptimizations() {
        if (this.isMobile()) {
            // Reduzir animações em mobile
            document.documentElement.style.setProperty('--animation-duration', '0.2s');
        }
        if (this.isSlowConnection()) {
            // Desabilitar algumas funcionalidades em conexão lenta
            document.documentElement.style.setProperty('--enable-animations', 'false');
        }
    }
}
exports.PerformanceOptimizer = PerformanceOptimizer;
PerformanceOptimizer.loadedModules = new Set();
