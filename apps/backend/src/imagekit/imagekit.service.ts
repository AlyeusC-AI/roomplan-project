import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class ImageKitService {
  constructor(private configService: ConfigService) {}

  generateAuthToken() {
    const privateKey = this.configService.get('IMAGEKIT_PRIVATE_KEY');
    const expire = Math.floor(Date.now() / 1000) + 3600; // 1 hour expiry
    const token = crypto.randomBytes(16).toString('hex');
    const signature = crypto
      .createHmac('sha1', privateKey)
      .update(token + expire)
      .digest('hex');

    return {
      token,
      expire,
      signature,
    };
  }
}
