import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { WaybillsController } from './waybill.controller';
import { WaybillsService } from './waybill.service';
import { Waybill } from './waybill.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Waybill]),
  ],
  controllers: [WaybillsController],
  providers: [WaybillsService],
  exports: [WaybillsService, SequelizeModule],
})
export class WaybillsModule {}