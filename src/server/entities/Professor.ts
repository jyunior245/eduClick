import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, Column } from 'typeorm';
import { Usuario } from './Usuario';
import { Aula } from './Aula';

@Entity()
export class Professor {
  @Column({ nullable: true })
  nome?: string;

  @Column({ nullable: true })
  telefone?: string;
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  uid!: string;

  @OneToOne(() => Usuario, { nullable: false })
  @JoinColumn()
  usuario!: Usuario;

  @Column({ nullable: true })
  nome_personalizado?: string;

  @Column({ nullable: true })
  especialidade?: string;

  @Column({ nullable: true })
  formacao?: string;

  @Column({ nullable: true })
  experiencia?: string;

  // No schema a coluna é exatamente "linkUnico" (com aspas)
  @Column({ name: 'linkUnico', nullable: true, unique: true })
  linkUnico?: string;

  // No schema a coluna é exatamente "fotoUrl" (com aspas)
  @Column({ name: 'fotoUrl', nullable: true })
  fotoUrl?: string;

  @OneToMany(() => Aula, aula => aula.professor)
  aulas!: Aula[];
}