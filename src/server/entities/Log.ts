import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Usuario } from './Usuario';

@Entity()
export class Log {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Usuario)
  usuario!: Usuario;

  @Column()
  acao!: string;

  @Column('text')
  detalhes!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  data_log!: Date;
}