import { Module } from '@nestjs/common';
import { SpaceController } from './space.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [SpaceController],
  providers: [],
  exports: [],
})
export class SpaceModule {}
