import { Controller, Get, Post, Body, UseGuards, Patch, Param, Delete, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ProductCategoriesService } from './product-categories.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleEnum } from 'src/roles/enums/role.enum';
import { User, UserPayload } from 'src/auth/decorators/user.decorator';

@Controller('product-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductCategoriesController {
  constructor(private readonly categoriesService: ProductCategoriesService) {}

  @Roles(RoleEnum.Admin)
  @Post()
  create(@Body() createDto: CreateProductCategoryDto, @User() user: UserPayload) {
    return this.categoriesService.create(createDto, user.tenantId);
  }

  @Get()
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Kitchen)
  findAll(@User() user: UserPayload) {
    return this.categoriesService.findAll(user.tenantId);
  }

  @Get(':id')
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Kitchen)
  findOne(@Param('id', ParseUUIDPipe) id: string, @User() user: UserPayload) {
    return this.categoriesService.findOne(id, user.tenantId);
  }

  @Roles(RoleEnum.Admin)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdateProductCategoryDto, @User() user: UserPayload) {
    return this.categoriesService.update(id, updateDto, user.tenantId);
  }

  @Roles(RoleEnum.Admin)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @User() user: UserPayload) {
    return this.categoriesService.remove(id, user.tenantId);
  }
}