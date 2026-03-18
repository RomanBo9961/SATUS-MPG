import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ModuleEntity extends Document {
  // Mongo genera el _id automáticamente (reemplaza a PrimaryGeneratedColumn)

  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description: string;

  // Relación ManyToMany con Roles
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Role' }] })
  roles: Types.ObjectId[];
}

export const ModuleSchema = SchemaFactory.createForClass(ModuleEntity);
