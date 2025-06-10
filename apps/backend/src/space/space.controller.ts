import { Controller, Get, Body, UseGuards, Query } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
@Controller('/space')
export class SpaceController {
  private s3Client: S3Client;
  constructor() {
    this.s3Client = new S3Client({
      endpoint: 'https://nyc3.digitaloceanspaces.com',
      region: 'nyc3',
      credentials: {
        accessKeyId: 'DO801Z3YVJ9ZHHF3YTDP',
        secretAccessKey: 'FZCt9407cEzF6OQzGCMcdjR7QhO79aUwJg+F2VB/3ro',
      },
    });
  }

  @Get()
  async getAuthToken(@Query('fileName') fileName: string) {
    try {
      // Generate a unique key for the file
      const key = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileName.split('.').pop()}`;

      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      const contentType =
        fileExtension === 'jpg' || fileExtension === 'jpeg'
          ? 'image/jpeg'
          : `image/${fileExtension}`;

      // Create the command to upload the file
      const command = new PutObjectCommand({
        Bucket: 'pcloud',
        Key: key,
        ContentType: contentType,
      });

      // Generate a signed URL with specific parameters
      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600, // URL expires in 1 hour
      });

      // Return both the signed URL and the public URL
      return {
        signedUrl,
        publicUrl: `https://nyc3.digitaloceanspaces.com/pcloud/${key}`,
        key,
      };
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw error;
    }
  }
}

// import { Controller, Post, Body, UseGuards } from '@nestjs/common';
// import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// @Controller('file')
// export class FileController {
//   private s3Client: S3Client;

//   @UseGuards(JwtAuthGuard)
//   @Post('get-upload-url')
//   async getUploadUrl(@Body('fileName') fileName: string) {

//   }
// }
