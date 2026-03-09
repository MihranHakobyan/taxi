import {
  Controller, Get, Patch, Delete, Body, Param,
  Query, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe
} from '@nestjs/common';
import { DriversService } from './drivers.service';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { DriverQueryDto } from './dto/driver-query.dto'; 
import { WaybillQueryDto } from './dto/waybill-query.dto'; 
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { DriverStatus } from './driver.model';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DriversController {
  constructor(private readonly driversService: DriversService) { }

  @Get()
  findAll(@Query() query: DriverQueryDto) {
    return this.driversService.findAll(query);
  }

  @Get('me')
  getMe(@CurrentUser('userId') driverId: string) {
    return this.driversService.findOne(driverId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.driversService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateDriverDto) {
    return this.driversService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: DriverStatus
  ) {
    return this.driversService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.driversService.remove(id);
  }

  @Get('me/waybills')
  getMyWaybills(
    @CurrentUser('userId') driverId: string,
    @Query() query: WaybillQueryDto
  ) {
    return this.driversService.findWaybills(driverId, query.startDate, query.endDate);
  }

  @Get(':id/waybills')
  @Roles(Role.ADMIN)
  getDriverWaybills(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: WaybillQueryDto
  ) {
    return this.driversService.findWaybills(id, query.startDate, query.endDate);
  }
}