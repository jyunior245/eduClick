import { Usuario } from "./Usuario";

export class Professor extends Usuario {
  fotoPerfil?: string; // base64 ou URL
  descricao?: string;
  conteudosDominio: string[] = [];
  linkUnico?: string;
  telefone?: string;
  formacao?: string;
  experiencia?: string;
  especialidade?: string;
  bio?: string;
  observacoes?: string;

  constructor(
    firebaseUser: any, // objeto do Firebase (ou algo que tenha uid, displayName, email)
    props?: {
      fotoPerfil?: string;
      descricao?: string;
      conteudosDominio?: string[];
      linkUnico?: string;
      telefone?: string;
      formacao?: string;
      experiencia?: string;
      especialidade?: string;
      bio?: string;
      observacoes?: string;
    }
  ) {
    super(firebaseUser); // chama o construtor Usuario

    if (props) {
      this.fotoPerfil = props.fotoPerfil;
      this.descricao = props.descricao;
      this.conteudosDominio = props.conteudosDominio || [];
      this.linkUnico = props.linkUnico;
      this.telefone = props.telefone;
      this.formacao = props.formacao;
      this.experiencia = props.experiencia;
      this.especialidade = props.especialidade;
      this.bio = props.bio;
      this.observacoes = props.observacoes;
    }
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
