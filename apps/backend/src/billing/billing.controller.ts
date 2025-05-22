import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  RawBodyRequest,
  Req,
  UseGuards,
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

// @Injectable()
// class SkipAuthGuard implements CanActivate {
//   canActivate(context: ExecutionContext): boolean {
//     const request = context.switchToHttp().getRequest();
//     return request.path === '/billing/webhook';
//   }
// }

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('organizations/:organizationId/checkout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a checkout session for subscription' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        priceId: {
          type: 'string',
          description: 'Stripe price ID for the subscription plan',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Checkout session created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Organization not found.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async createCheckoutSession(
    @Param('organizationId') organizationId: string,
    @Body('priceId') priceId: string,
    @Body('type') type: string,
    @Body('plan') plan: string,
    @Body('noTrial') noTrial: boolean,
    @Req() request,
  ) {
    const user = request.user;
    return this.billingService.createCheckoutSession(
      {
        organizationId,
        priceId,
        type,
        plan,
        noTrial,
      },
      user,
    );
  }

  @Post('organizations/:organizationId/portal')
  @ApiOperation({ summary: 'Create a customer portal session' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiResponse({
    status: 201,
    description: 'Portal session created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Organization not found.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async createPortalSession(@Param('organizationId') organizationId: string) {
    return this.billingService.createPortalSession(organizationId);
  }

  @Get('plans')
  @ApiOperation({ summary: 'Get available subscription plans' })
  @ApiResponse({
    status: 200,
    description: 'Return all available subscription plans.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getSubscriptionPlans() {
    return this.billingService.getSubscriptionPlans();
  }

  @Post('webhook')
  // Public endpoint for Stripe webhooks - no authentication required
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<any>,
  ) {
    if (!signature) {
      throw new BadRequestException('No stripe signature found');
    }
    if (!request.rawBody) {
      throw new BadRequestException('No raw body found');
    }

    try {
      const result = await this.billingService.handleWebhook(
        signature,
        request.rawBody,
      );
      return result;
    } catch (error) {
      console.error('Webhook error:', error);
      throw new BadRequestException(error.message);
    }
  }

  @Post('organizations/:organizationId/users')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update additional users for subscription' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        additionalUsers: {
          type: 'number',
          description: 'Number of additional users to add to the subscription',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Users updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Organization not found.' })
  async updateAdditionalUsers(
    @Param('organizationId') organizationId: string,
    @Body('additionalUsers') additionalUsers: number,
  ) {
    return this.billingService.updateAdditionalUsers(
      organizationId,
      additionalUsers,
    );
  }

  @Get('organizations/:organizationId/subscription')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get subscription information' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiResponse({
    status: 200,
    description: 'Subscription information retrieved successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Organization not found.' })
  async getSubscriptionInfo(@Param('organizationId') organizationId: string) {
    return this.billingService.getSubscriptionInfo(organizationId);
  }
}
