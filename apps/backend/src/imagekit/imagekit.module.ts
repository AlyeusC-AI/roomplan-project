import { Module } from '@nestjs/common';
import { ImageKitService } from './imagekit.service';
import { ImageKitController } from './imagekit.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [ImageKitController],
  providers: [ImageKitService],
  exports: [ImageKitService],
})
export class ImageKitModule {}
