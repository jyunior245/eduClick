import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  uid!: string;

  @Column({ nullable: false })
  nome!: string;

  @Column({ unique: true, nullable: false })
  email!: string;

  @Column({ nullable: false })
  senha!: string;

  @Column({ nullable: false })
  tipo!: string; // 'professor' ou 'aluno'

  // Token de push notifications (Firebase Cloud Messaging)
  @Column({ name: 'fcmtoken', nullable: true })
  fcmToken?: string;
}