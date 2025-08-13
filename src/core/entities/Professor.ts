import { Usuario } from "./Usuario";
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity("professor")
export class Professor /* extends Usuario */ {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", nullable: true })
  nome?: string;

  @Column({ type: "varchar", nullable: true })
  nomePersonalizado?: string;

  @Column({ type: "varchar", nullable: true })
  fotoPerfil?: string;

  @Column({ type: "varchar", nullable: true })
  descricao?: string;

  @Column({ type: "text", array: true, nullable: true })
  conteudosDominio?: string[];

  @Column({ type: "varchar", unique: true, nullable: true })
  linkUnico?: string;

  @Column({ type: "varchar", nullable: true })
  telefone?: string;

  @Column({ type: "varchar", nullable: true })
  formacao?: string;

  @Column({ type: "varchar", nullable: true })
  experiencia?: string;

  @Column({ type: "varchar", nullable: true })
  especialidade?: string;

  @Column({ type: "varchar", nullable: true })
  bio?: string;

  @Column({ type: "varchar", nullable: true })
  observacoes?: string;
}

