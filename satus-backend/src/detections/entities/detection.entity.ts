import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true }) // Crear automáticamente 'createdAt' y 'updatedAt'
export class Detection extends Document {
  @Prop({ required: true })
  url: string;

  @Prop()
  riskLevel: string;

  @Prop()
  message: string;

  @Prop({ type: Object })
  details: any;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId; 
}

export const DetectionSchema = SchemaFactory.createForClass(Detection);
