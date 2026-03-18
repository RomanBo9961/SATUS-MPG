import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/entities/user.entity';
import { ModuleEntity } from '../../modules/entities/module.entity';

@Schema({ timestamps: true })
export class Role extends Document {
  // En Mongo no usamos PrimaryGeneratedColumn, el ID es automático (_id)

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  // Relación ManyToMany con Usuarios (Referencia)
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  users: User[];

  // Relación ManyToMany con Módulos (Referencia)
  // Nota: El "eager: true" lo manejaremos con .populate() en el Service
  @Prop({ type: [{ type: Types.ObjectId, ref: 'ModuleEntity' }] })
  modules: ModuleEntity[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
