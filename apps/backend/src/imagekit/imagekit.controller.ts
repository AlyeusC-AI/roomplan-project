import { Controller, Get } from '@nestjs/common';
import { ImageKitService } from './imagekit.service';

@Controller('/imageKit')
export class ImageKitController {
  constructor(private readonly imageKitService: ImageKitService) {}

  @Get()
  getAuthToken() {
    return this.imageKitService.generateAuthToken();
  }
}
