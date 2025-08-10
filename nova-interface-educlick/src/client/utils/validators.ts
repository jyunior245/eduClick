// Sistema centralizado de validação

export interface ValidationRule {
  test: (value: any) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class Validators {
  // Validações básicas
  static required(value: any): ValidationRule {
    return {
      test: (val) => val !== null && val !== undefined && val.toString().trim() !== '',
      message: 'Este campo é obrigatório'
    };
  }

  static email(value: string): ValidationRule {
    return {
      test: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      message: 'E-mail deve ser válido'
    };
  }

  static minLength(min: number): ValidationRule {
    return {
      test: (val) => val && val.toString().length >= min,
      message: `Deve ter pelo menos ${min} caracteres`
    };
  }

  static maxLength(max: number): ValidationRule {
    return {
      test: (val) => !val || val.toString().length <= max,
      message: `Deve ter no máximo ${max} caracteres`
    };
  }

  static pattern(regex: RegExp, message: string): ValidationRule {
    return {
      test: (val) => regex.test(val),
      message
    };
  }

  static numeric(value: any): ValidationRule {
    return {
      test: (val) => !isNaN(Number(val)) && Number(val) >= 0,
      message: 'Deve ser um número válido'
    };
  }

  static positive(value: any): ValidationRule {
    return {
      test: (val) => Number(val) > 0,
      message: 'Deve ser um valor positivo'
    };
  }

  static date(value: string): ValidationRule {
    return {
      test: (val) => !isNaN(Date.parse(val)),
      message: 'Data deve ser válida'
    };
  }

  static futureDate(value: string): ValidationRule {
    return {
      test: (val) => new Date(val) > new Date(),
      message: 'Data deve ser futura'
    };
  }

  // Validações específicas do domínio
  static telefone(value: string): ValidationRule {
    return {
      test: (val) => /^\(\d{2}\) \d{4,5}-\d{4}$/.test(val),
      message: 'Telefone deve estar no formato (11) 99999-9999'
    };
  }

  static linkUnico(value: string): ValidationRule {
    return {
      test: (val) => /^[a-zA-Z0-9-_]+$/.test(val),
      message: 'Link único deve conter apenas letras, números, hífens e underscores'
    };
  }

  // Função para aplicar múltiplas validações
  static validate(value: any, rules: ValidationRule[]): ValidationResult {
    const errors: string[] = [];
    
    for (const rule of rules) {
      if (!rule.test(value)) {
        errors.push(rule.message);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validações compostas para formulários específicos
  static validateLogin(data: { email: string; senha: string }): ValidationResult {
    const errors: string[] = [];
    
    const emailResult = this.validate(data.email, [this.required(data.email), this.email(data.email)]);
    const senhaResult = this.validate(data.senha, [this.required(data.senha), this.minLength(6)]);
    
    errors.push(...emailResult.errors, ...senhaResult.errors);
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateCadastro(data: { nome: string; email: string; senha: string; confirmarSenha: string }): ValidationResult {
    const errors: string[] = [];
    
    const nomeResult = this.validate(data.nome, [this.required(data.nome), this.minLength(3)]);
    const emailResult = this.validate(data.email, [this.required(data.email), this.email(data.email)]);
    const senhaResult = this.validate(data.senha, [this.required(data.senha), this.minLength(6)]);
    
    errors.push(...nomeResult.errors, ...emailResult.errors, ...senhaResult.errors);
    
    if (data.senha !== data.confirmarSenha) {
      errors.push('As senhas não coincidem');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateAula(data: { titulo: string; conteudo: string; valor: number; duracao: number; maxAlunos: number; dataHora: string }): ValidationResult {
    const errors: string[] = [];
    
    const tituloResult = this.validate(data.titulo, [this.required(data.titulo), this.minLength(3)]);
    const conteudoResult = this.validate(data.conteudo, [this.required(data.conteudo), this.minLength(10)]);
    const valorResult = this.validate(data.valor, [this.required(data.valor), this.numeric(data.valor), this.positive(data.valor)]);
    const duracaoResult = this.validate(data.duracao, [this.required(data.duracao), this.numeric(data.duracao), this.positive(data.duracao)]);
    const maxAlunosResult = this.validate(data.maxAlunos, [this.required(data.maxAlunos), this.numeric(data.maxAlunos), this.positive(data.maxAlunos)]);
    const dataHoraResult = this.validate(data.dataHora, [this.required(data.dataHora), this.date(data.dataHora), this.futureDate(data.dataHora)]);
    
    errors.push(
      ...tituloResult.errors,
      ...conteudoResult.errors,
      ...valorResult.errors,
      ...duracaoResult.errors,
      ...maxAlunosResult.errors,
      ...dataHoraResult.errors
    );
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 