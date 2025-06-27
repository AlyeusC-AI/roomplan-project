import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.access_token;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
      include: {
        organizationMemberships: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
    console.log('🚀 ~ JwtStrategy ~ vsssalidate ~ user:', user);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      userId: payload.sub,
      email: payload.email,
      organizationId: user.organizationMemberships[0]?.organizationId,
      user: {
        ...user,
        organizationId: user.organizationMemberships[0]?.organizationId,
      },
    };
  }
}
