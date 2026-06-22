import { Module } from '@nestjs/common';
import { PaymentsController } from './controllers/payments/payments.controller';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [
    AuthModule
  ],
  controllers: [PaymentsController],
  providers: [],
})
export class PaymentsModule { }
