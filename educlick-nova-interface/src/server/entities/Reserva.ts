import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Aula } from './Aula';
import { Aluno } from './Aluno';

@Entity()
export class Reserva {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Aula, aula => aula.reservas)
  aula!: Aula;

  @ManyToOne(() => Aluno, aluno => aluno.reservas)
  aluno!: Aluno;


  @Column()
  status!: string; // 'ativa', 'cancelada'

  // Dados informados na reserva pública (redundantes ao Usuario do Aluno, se existir)
  @Column({ nullable: true })
  nome?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  telefone?: string;

  // Token FCM do dispositivo no momento da reserva (para alunos não logados)
  @Column({ nullable: true })
  fcmToken?: string;

  @Column()
  data_reserva!: Date;

  @Column({ nullable: true })
  data_cancelamento?: Date;

  // Controle para lembrete 30 minutos antes da aula (para não enviar duplicado)
  @Column({ default: false })
  reminder_enviado!: boolean;
}