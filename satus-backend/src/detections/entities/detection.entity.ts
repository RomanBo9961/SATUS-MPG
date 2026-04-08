import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) // Esto crea automáticamente 'createdAt' y 'updatedAt'
export class Detection extends Document {
  @Prop({ required: true })
  url: string;

  @Prop()
  riskLevel: string;

  @Prop()
  message: string;

  @Prop({ type: Object })
  details: any;
}

export const DetectionSchema = SchemaFactory.createForClass(Detection);
