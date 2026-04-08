import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Payment, PaymentStatus } from './payment.model';
import axios, { AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  private readonly apiUrl = 'https://api.yookassa.ru/v3/payments';
  private readonly authHeader: string;

  constructor(
    @InjectModel(Payment)
    private readonly paymentModel: typeof Payment,
  ) {
    const auth = Buffer.from(`${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`).toString('base64');
    this.authHeader = `Basic ${auth}`;
  }

  async createPayment(waybillId: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const idempotencyKey = uuidv4();

    try {
      const { data } = await axios.post(
        this.apiUrl,
        {
          amount: { value: amount.toFixed(2), currency: 'RUB' },
          capture: true,
          confirmation: {
            type: 'redirect',
            return_url: `${process.env.FRONTEND_URL}/payments/status?waybillId=${waybillId}`,
          },
          description: `Payment for Waybill #${waybillId}`,
          payment_method_data: { type: 'bank_card' },
        },
        {
          headers: {
            'Idempotence-Key': idempotencyKey,
            'Authorization': this.authHeader,
            'Content-Type': 'application/json',
          },
        }
      );

      await this.paymentModel.create({
        externalId: data.id,
        amount,
        waybillId,
        status: data.status as PaymentStatus,
        rawResponse: data,
      });

      return {
        confirmationUrl: data.confirmation.confirmation_url,
        paymentId: data.id
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        const message = axiosError.response?.data?.description || axiosError.message;
        throw new InternalServerErrorException(`Yookassa API Error: ${message}`);
      }
      throw new InternalServerErrorException('An unexpected error occurred during the payment process');
    }
  }

  async handleWebhook(payload: any) {
    const { event, object } = payload;

    if (!object?.id) {
      return { status: 'ignored' };
    }

    const payment = await this.paymentModel.findOne({ 
      where: { externalId: object.id } 
    });

    if (!payment) {
      throw new NotFoundException('Payment record not found');
    }

    let status: PaymentStatus = payment.status;

    if (event === 'payment.succeeded') {
      status = PaymentStatus.SUCCEEDED;
    } else if (event === 'payment.canceled') {
      status = PaymentStatus.CANCELED;
    } else if (event === 'payment.waiting_for_capture') {
      status = PaymentStatus.WAITING_FOR_CAPTURE;
    }

    await payment.update({ 
      status, 
      rawResponse: object 
    });

    return { status: 'success' };
  }
}