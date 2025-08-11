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

  @Column({ nullable: true, unique: true })
  linkUnico?: string;

  // URL pública da foto de perfil no Firebase Storage
  @Column({ nullable: true })
  fotoUrl?: string;

  // Stripe Connect: ID da conta conectada do professor (acct_...)
  @Column({ nullable: true })
  stripeAccountId?: string;

  @OneToMany(() => Aula, aula => aula.professor)
  aulas!: Aula[];
}