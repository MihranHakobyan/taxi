import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';

@ApiTags('Cars')
@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new car' })
  @ApiResponse({ status: 201, description: 'Car created successfully' })
  create(@Body() dto: CreateCarDto) {
    return this.carsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all cars with pagination' })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.carsService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get car details by ID' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.carsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update car details or assign driver' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCarDto,
  ) {
    return this.carsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete car' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.carsService.remove(id);
  }
}