import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from '../../roles/entities/role.entity';

@Schema({ timestamps: true, collection: 'users' })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  docType: string;

  @Prop({ required: true })
  docNumber: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ unique: true, required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Role' }] })
roles: Role[];

}

export const UserSchema = SchemaFactory.createForClass(User);
