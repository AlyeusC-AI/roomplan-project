import { CanActivate, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: any): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = this.extractTokenFromHeader(client);

      if (!token) {
        throw new WsException('Unauthorized');
      }

      const payload = await this.jwtService.verifyAsync(token);
      console.log('🚀 ~ WsJwtGuard ~ canActivate ~ payload:', payload);
      client.data.user = {
        userId: payload.sub,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        role: payload.role,
        organizationId: payload.organizationId,
        projectId: payload.projectId,
      };

      return true;
    } catch (error) {
      throw new WsException('Unauthorized');
    }
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const auth =
      client.handshake.auth.token || client.handshake.headers.authorization;
    console.log('🚀 ~ WsJwtGuard ~ extractTokenFromHeader ~ auth:', auth);

    if (!auth) {
      return undefined;
    }

    if (auth.startsWith('Bearer ')) {
      return auth.substring(7);
    }

    return auth;
  }
}
