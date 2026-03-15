import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { Driver } from './driver.model';
import { AuthModule } from '../auth/auth.module';
// import { SmsService } from 'src/sms/sms.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Driver]),
    forwardRef(() => AuthModule),
  ],
  controllers: [DriversController],
  providers: [DriversService],
  exports: [DriversService, SequelizeModule],
})
export class DriversModule {}