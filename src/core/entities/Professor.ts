import { Usuario } from "./Usuario";

export class Professor extends Usuario {
  constructor(
    public readonly id: string,
    public nome: string,
    public email: string,
    public senha: string,
    public fotoPerfil?: string, // base64 ou URL
    public descricao?: string,
    public conteudosDominio: string[] = [], // ex: ["Matemática", "Física", "Química"]
    public linkUnico?: string, // link único para alunos acessarem
    public telefone?: string,
    public formacao?: string,
    public experiencia?: string,
    public especialidade?: string,
    public bio?: string,
    public observacoes?: string
  ) {
    super(id, nome, email, senha);
  }

  gerarLinkUnico(): string {
    if (!this.linkUnico) {
      this.linkUnico = `professor-${this.id}-${Date.now()}`;
    }
    return this.linkUnico;
  }

  getLinkPublico(): string {
    return `/professor/${this.linkUnico || this.gerarLinkUnico()}`;
  }
}