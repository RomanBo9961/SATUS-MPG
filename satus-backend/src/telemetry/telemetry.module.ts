import { Module } from '@nestjs/common';
import { TelemetryGateway } from './gateways/telemetry/telemetry.gateway';

@Module({
  providers: [TelemetryGateway],
  exports: [TelemetryGateway],
})
export class TelemetryModule { }
