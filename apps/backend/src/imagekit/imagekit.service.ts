import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ImageKit from 'imagekit';

interface ImageKitUploadResponse {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  height?: number;
  width?: number;
  size?: number;
  filePath: string;
  tags?: string[];
  isPrivateFile?: boolean;
  customCoordinates?: string | null;
  metadata?: Record<string, any>;
}

@Injectable()
export class ImageKitService {
  private imagekit: ImageKit;

  constructor(private configService: ConfigService) {
    this.imagekit = new ImageKit({
      publicKey: this.configService.get('IMAGEKIT_PUBLIC_KEY') || '',
      privateKey: this.configService.get('IMAGEKIT_PRIVATE_KEY') || '',
      urlEndpoint: this.configService.get('IMAGEKIT_URL_ENDPOINT') || '',
    });
  }

  generateAuthToken() {
    return this.imagekit.getAuthenticationParameters();
  }

  async uploadFile(
    file: Buffer,
    fileName: string,
    folder: string = 'csv',
  ): Promise<ImageKitUploadResponse> {
    try {
      const result = await this.imagekit.upload({
        file: file,
        fileName: fileName,
        folder: folder,
        useUniqueFileName: true,
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to upload file to ImageKit: ${error.message}`);
    }
  }

  async getFileUrl(fileId: string): Promise<string> {
    try {
      const fileDetails = await this.imagekit.getFileDetails(fileId);
      return fileDetails.url;
    } catch (error) {
      throw new Error(`Failed to get file URL from ImageKit: ${error.message}`);
    }
  }

  async deleteFile(fileId: string): Promise<boolean> {
    try {
      await this.imagekit.deleteFile(fileId);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete file from ImageKit: ${error.message}`);
    }
  }
}
