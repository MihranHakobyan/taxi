//twillo e anhrajesht vor ashxati dra hamar em comment arel
// import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import axios from 'axios';

// @Injectable()
// export class SmsService {
//   private readonly logger = new Logger(SmsService.name);

//   constructor(private configService: ConfigService) {}

//   async sendOtp(phone: string, code: string): Promise<void> {
//     const apiKey = this.configService.get<string>('SMS_API_KEY');
//     const baseUrl = this.configService.get<string>('SMS_BASE_URL');
//     const sender = this.configService.get<string>('SMS_SENDER_NAME');

//     const message = `Your verification code is: ${code}`;

//     try {
//       const response = await axios.post(baseUrl, {
//         api_key: apiKey,
//         to: phone,
//         from: sender,
//         text: message,
//       }, {
//         timeout: 5000,
//       });

//       if (response.status !== 200 && response.status !== 201) {
//         throw new Error(`Provider status: ${response.status}`);
//       }

//       this.logger.log(`SMS sent successfully to ${phone}`);
//     } catch (error:any) {
//       this.logger.error(`SMS delivery failed to ${phone}`, error.stack);
//       throw new InternalServerErrorException('Failed to send verification code');
//     }
//   }
// }