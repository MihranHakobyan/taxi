import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post('checkout')
    @ApiOperation({ summary: 'Create a new payment and get redirect URL' })
    @ApiResponse({ status: 201, description: 'Success' })
    async createCheckout(@Body() body: { waybillId: string; amount: number }) {
        return this.paymentsService.createPayment(body.waybillId, body.amount);
    }

    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Yookassa Webhook callback' })
    async handleWebhook(@Body() payload: any) {
        return this.paymentsService.handleWebhook(payload);
    }
} 