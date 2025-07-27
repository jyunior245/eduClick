// Utilitários para otimização de performance

export class PerformanceOptimizer {
  private static loadedModules = new Set<string>();

  /**
   * Carregamento lazy de módulos para melhorar performance inicial
   */
  static async loadModule(moduleName: string): Promise<any> {
    if (this.loadedModules.has(moduleName)) {
      return Promise.resolve();
    }

    try {
      // Simular carregamento lazy (em produção, usar dynamic imports)
      this.loadedModules.add(moduleName);
      return Promise.resolve();
    } catch (error) {
      console.error(`Erro ao carregar módulo ${moduleName}:`, error);
      throw error;
    }
  }

  /**
   * Debounce para evitar múltiplas chamadas desnecessárias
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Throttle para limitar frequência de execução
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
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
  static isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Verificar conexão lenta para aplicar otimizações
   */
  static isSlowConnection(): boolean {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection.effectiveType === 'slow-2g' || 
             connection.effectiveType === '2g' || 
             connection.effectiveType === '3g';
    }
    return false;
  }

  /**
   * Aplicar otimizações baseadas no dispositivo/conexão
   */
  static applyOptimizations(): void {
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