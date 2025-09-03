import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { User, UserPayload } from 'src/auth/decorators/user.decorator';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  create(@Body() createCustomerDto: CreateCustomerDto, @User() user: UserPayload) {
    return this.customersService.create(createCustomerDto, user.tenantId);
  }

  @Get()
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  findAll(@User() user: UserPayload) {
    return this.customersService.findAll(user.tenantId);
  }

  @Get(':id')
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  findOne(@Param('id', ParseUUIDPipe) id: string, @User() user: UserPayload) {
    return this.customersService.findOne(id, user.tenantId);
  }

  @Patch(':id')
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCustomerDto: UpdateCustomerDto, @User() user: UserPayload) {
    return this.customersService.update(id, updateCustomerDto, user.tenantId);
  }

  @Delete(':id')
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  remove(@Param('id', ParseUUIDPipe) id: string, @User() user: UserPayload) {
    return this.customersService.remove(id, user.tenantId);
  }
}