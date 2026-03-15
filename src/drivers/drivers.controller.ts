import {
  Controller, Get, Patch, Delete, Body, Param,
  Query, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
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

@ApiTags('Drivers Management')
@ApiBearerAuth('accessToken')
@Controller('drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DriversController {
  constructor(private readonly driversService: DriversService) { }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Find all drivers (Admin only)' })
  @ApiResponse({ status: 200, description: 'Return list of drivers' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires Admin role' })
  findAll(@Query() query: DriverQueryDto) {
    return this.driversService.findAll(query);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current driver profile' })
  @ApiResponse({ status: 200, description: 'Return personal profile data' })
  getMe(@CurrentUser('userId') driverId: string) {
    return this.driversService.findOne(driverId);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get driver by id (Admin only)' })
  @ApiResponse({ status: 200, description: 'Return driver data' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.driversService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update driver details' })
  @ApiResponse({ status: 200, description: 'Driver successfully updated' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateDriverDto) {
    return this.driversService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update driver status' })
  @ApiBody({ 
    schema: { 
      type: 'object',
      properties: { status: { type: 'string', enum: Object.values(DriverStatus), example: 'ACTIVE' } } 
    } 
  })
  @ApiResponse({ status: 200, description: 'Status successfully updated' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: DriverStatus
  ) {
    return this.driversService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete driver account' })
  @ApiResponse({ status: 200, description: 'Driver successfully deleted' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.driversService.remove(id);
  }

  @Get('me/waybills')
  @ApiOperation({ summary: 'Get current driver\'s waybills' })
  @ApiResponse({ status: 200, description: 'Return waybill history' })
  getMyWaybills(
    @CurrentUser('userId') driverId: string,
    @Query() query: WaybillQueryDto
  ) {
    return this.driversService.findWaybills(driverId, query.startDate, query.endDate);
  }

  @Get(':id/waybills')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get any driver\'s waybills (Admin only)' })
  @ApiResponse({ status: 200, description: 'Return driver\'s waybill history' })
  getDriverWaybills(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: WaybillQueryDto
  ) {
    return this.driversService.findWaybills(id, query.startDate, query.endDate);
  }
}