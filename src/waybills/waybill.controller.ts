import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe, Res, StreamableFile, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';

import { WaybillsService } from './waybill.service';

import { CreateWaybillDto } from './dto/create-waybill.dto';
import { UpdateWaybillDto } from './dto/update-waybill.dto';
import { WaybillQueryDto } from './dto/waybill-query.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Waybills')
@ApiBearerAuth('accessToken')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('waybills')
export class WaybillsController {
    constructor(private readonly waybillsService: WaybillsService) { }

    @Post()
    @Roles(Role.ADMIN, Role.USER)
    @ApiOperation({ summary: 'Create a new waybill (Admin & User)' })
    @ApiResponse({ status: 201, description: 'Waybill successfully created' })
    @ApiResponse({ status: 400, description: 'Driver already has an active waybill' })
    create(@Body() dto: CreateWaybillDto) {
        return this.waybillsService.create(dto);
    }

    @Get()
    @Roles(Role.ADMIN, Role.USER)
    @ApiOperation({ summary: 'Get waybills list with filters (Admin & User)' })
    @ApiResponse({ status: 200, description: 'List of waybills retrieved' })
    findAll(@Query() query: WaybillQueryDto) {
        return this.waybillsService.findAll(query);
    }
    @Get('pdf')
    @Roles(Role.ADMIN, Role.USER)
    @ApiOperation({ summary: 'Get waybill pdf' })
    @ApiResponse({ status: 200, description: 'Waybill pdf retrieved' })
    async getPdf(@Res({ passthrough: true }) res: Response) {
        const pdfBuffer = await this.waybillsService.getPdf();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="list.pdf"',
            'Content-Length': pdfBuffer.length,
        });

        return new StreamableFile(pdfBuffer);
    }
    @Get('active/:driverId')
    @Roles(Role.ADMIN, Role.USER)
    @ApiOperation({ summary: 'Get active waybill for a driver' })
    @ApiParam({ name: 'driverId', format: 'uuid' })
    @ApiResponse({ status: 200, description: 'Active waybill data' })
    @ApiResponse({ status: 404, description: 'No active waybill found' })
    findActive(@Param('driverId', ParseUUIDPipe) driverId: string) {
        return this.waybillsService.findActiveByDriver(driverId);
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.USER)
    @ApiOperation({ summary: 'Get waybill details' })
    @ApiResponse({ status: 200, description: 'Waybill details retrieved' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.waybillsService.findOne(id);
    }




    @Patch(':id')
    @Roles(Role.ADMIN, Role.USER)
    @ApiOperation({ summary: 'Update or Close waybill (Admin & User)' })
    @ApiResponse({ status: 200, description: 'Waybill updated successfully' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateWaybillDto,
    ) {
        return this.waybillsService.update(id, dto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete waybill record (Admin only)' })
    @ApiResponse({ status: 200, description: 'Waybill deleted successfully' })
    @ApiResponse({ status: 404, description: 'Waybill not found' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.waybillsService.remove(id);
    }
}