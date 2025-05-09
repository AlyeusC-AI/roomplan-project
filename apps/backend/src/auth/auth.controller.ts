import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Request,
  Res,
  Put,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
  })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, user } = await this.authService.register(registerDto);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    });

    return { user, access_token };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, user } = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    });

    return { user, access_token };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged out',
  })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { message: 'Logged out successfully' };
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify user email' })
  @ApiResponse({
    status: 200,
    description: 'Email successfully verified',
    schema: {
      properties: {
        message: { type: 'string', example: 'Email verified successfully' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid verification token' })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('request-password-reset')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent if email exists',
    schema: {
      properties: {
        message: {
          type: 'string',
          example:
            'If your email is registered, you will receive a password reset link',
        },
      },
    },
  })
  async requestPasswordReset(
    @Body() requestPasswordResetDto: RequestPasswordResetDto,
  ) {
    return this.authService.requestPasswordReset(requestPasswordResetDto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiResponse({
    status: 200,
    description: 'Password successfully reset',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'Password reset successful',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  async resetPassword(
    @Query('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(token, resetPasswordDto.password);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({
    status: 200,
    description: 'Current user information',
    schema: {
      properties: {
        id: { type: 'string', example: '1' },
        email: { type: 'string', example: 'john.doe@example.com' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@Request() req) {
    return this.authService.getCurrentUser(req.user);
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent if email exists and is not verified',
    schema: {
      properties: {
        message: {
          type: 'string',
          example:
            'If your email is registered, you will receive a verification link',
        },
      },
    },
  })
  async resendVerificationEmail(@Body('email') email: string) {
    return this.authService.resendVerificationEmail(email);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile successfully updated',
    schema: {
      properties: {
        id: { type: 'string', example: '1' },
        // email: { type: 'string', example: 'john.doe@example.com' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        phone: { type: 'string', example: '+1234567890' },
        avatar: { type: 'string', example: 'https://example.com/avatar.jpg' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(req.user.userId, updateProfileDto);
  }
}
