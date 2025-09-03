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
  HttpCode,
  HttpStatus,
  Query,
  ParseBoolPipe,
} from '@nestjs/common';
import { ProductCategoriesService } from './product-categories.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/enums/role.enum';
import { User, UserPayload } from '../auth/decorators/user.decorator';

@Controller('product-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.Admin, RoleEnum.Manager)
export class ProductCategoriesController {
  constructor(private readonly categoriesService: ProductCategoriesService) {}

  @Post()
  create(@Body() createDto: CreateProductCategoryDto, @User() user: UserPayload) {
    return this.categoriesService.create(createDto, user.tenantId);
  }

  @Get()
  findAll(@User() user: UserPayload, @Query('includeDeleted', new ParseBoolPipe({ optional: true })) includeDeleted: boolean = false) {
    return this.categoriesService.findAll(user.tenantId, includeDeleted);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateProductCategoryDto,
    @User() user: UserPayload,
  ) {
    return this.categoriesService.update(id, updateDto, user.tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @User() user: UserPayload) {
    return this.categoriesService.remove(id, user.tenantId);
  }

  @Patch(':id/restore')
  @HttpCode(HttpStatus.NO_CONTENT)
  restore(@Param('id', ParseUUIDPipe) id: string, @User() user: UserPayload) {
    return this.categoriesService.restore(id, user.tenantId);
  }

  @Patch('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  reorder(@Body() reorderDto: ReorderCategoriesDto, @User() user: UserPayload) {
    return this.categoriesService.reorder(reorderDto.orderedIds, user.tenantId);
  }
}