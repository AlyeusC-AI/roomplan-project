import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { OrganizationModule } from '../organization/organization.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [OrganizationModule, ConfigModule],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
