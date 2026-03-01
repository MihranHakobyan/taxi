import { Controller, Post, Body, UseGuards, Get, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateUserDto) { return this.usersService.create(dto); }

  @Get()
  @Roles(Role.ADMIN, Role.USER, Role.DRIVER)
  findAll(@Query() query: any) { return this.usersService.findAll(query); }

  @Get(':id')
  @Roles(Role.ADMIN, Role.USER, Role.DRIVER)
  findOne(@Param('id') id: string) { return this.usersService.findOne(id); }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) { return this.usersService.update(id, dto); }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) { return this.usersService.remove(id); }

  @Patch(':id/activate')
  @Roles(Role.ADMIN)
  activate(@Param('id') id: string) { return this.usersService.toggleStatus(id, true); }

  @Patch(':id/deactivate')
  @Roles(Role.ADMIN)
  deactivate(@Param('id') id: string) { return this.usersService.toggleStatus(id, false); }
}