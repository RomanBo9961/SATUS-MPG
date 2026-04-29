import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/entities/user.entity';
import { ModuleEntity } from '../../modules/entities/module.entity';

@Schema({ timestamps: true, collection: 'roles'  })
export class Role extends Document {
  
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [{ type: Types.ObjectId }] }) 
  users: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'ModuleEntity' }] })
  modules: any[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
