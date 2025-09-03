import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { PurchaseIngredientsDto } from './dto/purchase-ingredients.dto';
import { RegisterWasteDto } from './dto/register-waste.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/enums/role.enum';
import { User, UserPayload } from '../auth/decorators/user.decorator';

@Controller('ingredients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  create(@Body() createIngredientDto: CreateIngredientDto, @User() user: UserPayload) {
    return this.ingredientsService.create(createIngredientDto, user.tenantId);
  }

  @Get()
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Kitchen)
  findAll(@User() user: UserPayload) {
    return this.ingredientsService.findAll(user.tenantId);
  }

  @Post('purchase')
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  purchase(@Body() purchaseDto: PurchaseIngredientsDto, @User() user: UserPayload) {
    return this.ingredientsService.purchase(purchaseDto, user.userId, user.tenantId);
  }

  @Post('waste')
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  registerWaste(@Body() wasteDto: RegisterWasteDto, @User() user: UserPayload) {
    return this.ingredientsService.registerWaste(wasteDto, user.userId, user.tenantId);
  }

  @Post('adjust-stock')
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @HttpCode(HttpStatus.NO_CONTENT)
  adjustStock(@Body() adjustDto: AdjustStockDto, @User() user: UserPayload) {
    return this.ingredientsService.adjustStock(adjustDto, user.userId, user.tenantId);
  }

  @Get(':id/movements')
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  getMovementHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: UserPayload,
  ) {
    return this.ingredientsService.getMovementHistory(id, user.tenantId);
  }

  // ... otros endpoints como findOne, update, remove, etc. también deben pasar el tenantId
}