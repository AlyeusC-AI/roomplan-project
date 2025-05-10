import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ImageKit from 'imagekit';

@Injectable()
export class ImageKitService {
  constructor(private configService: ConfigService) {}

  generateAuthToken() {
    const imagekit = new ImageKit({
      publicKey: this.configService.get('IMAGEKIT_PUBLIC_KEY') || '',
      privateKey: this.configService.get('IMAGEKIT_PRIVATE_KEY') || '',
      urlEndpoint: this.configService.get('IMAGEKIT_URL_ENDPOINT') || '',
    });
    return imagekit.getAuthenticationParameters();
  }
}
