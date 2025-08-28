import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleEnum } from 'src/roles/enums/role.enum';
import { User, UserPayload } from 'src/auth/decorators/user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Admin)
  @Post()
  create(@Body() createUserDto: CreateUserDto, @User() adminUser: UserPayload) {
    // Un admin solo puede crear usuarios para su propio tenant.
    return this.usersService.create(createUserDto, adminUser.tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@User() user: UserPayload) {
    // El decorador @User extrae directamente el payload del token.
    return this.usersService.findOne(user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Admin)
  @Get()
  findAll(@User() adminUser: UserPayload) {
    return this.usersService.findAll(adminUser.tenantId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Admin)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @User() adminUser: UserPayload) {
    return this.usersService.findOne(id, adminUser.tenantId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Admin)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto, @User() adminUser: UserPayload) {
    return this.usersService.update(id, updateUserDto, adminUser.tenantId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Admin)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @User() adminUser: UserPayload) {
    return this.usersService.remove(id, adminUser.tenantId);
  }
}