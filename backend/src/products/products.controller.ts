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
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Query,
  ForbiddenException,
  Res,
  BadRequestException,
  DefaultValuePipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AssignIngredientsDto } from './dto/assign-ingredients.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/enums/role.enum';
import { User, UserPayload } from '../auth/decorators/user.decorator';
import { Response } from 'express';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  create(@Body() createProductDto: CreateProductDto, @User() user: UserPayload) {
    if (!user.locationId) {
      throw new ForbiddenException('No tienes una sucursal asignada para crear productos.');
    }
    return this.productsService.create(createProductDto, user.tenantId, user.locationId);
  }

  @Get()
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Kitchen)
  findAll(
    @User() user: UserPayload,
    @Query('includeUnavailable', new DefaultValuePipe(false), ParseBoolPipe) includeUnavailable: boolean,
  ) {
    if (!user.locationId) {
      throw new ForbiddenException('No tienes una sucursal asignada para ver productos.');
    }
    return this.productsService.findAll(user.tenantId, user.locationId, includeUnavailable);
  }

  @Get(':id')
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Kitchen)
  findOne(@Param('id', ParseUUIDPipe) id: string, @User() user: UserPayload) {
    if (!user.locationId) {
      throw new ForbiddenException('No tienes una sucursal asignada.');
    }
    return this.productsService.findOne(id, user.tenantId, user.locationId);
  }

  @Patch(':id')
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @User() user: UserPayload,
  ) {
    if (!user.locationId) {
      throw new ForbiddenException('No tienes una sucursal asignada para actualizar productos.');
    }
    return this.productsService.update(id, updateProductDto, user.tenantId, user.locationId);
  }

  @Delete(':id')
  @Roles(RoleEnum.Admin) // Only Admins should be able to permanently delete products
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @User() user: UserPayload) {
    if (!user.locationId) {
      throw new ForbiddenException('No tienes una sucursal asignada para eliminar productos.');
    }
    return this.productsService.disable(id, user.tenantId, user.locationId);
  }

  @Patch(':id/restore')
  @Roles(RoleEnum.Admin)
  restore(@Param('id', ParseUUIDPipe) id: string, @User() user: UserPayload) {
    if (!user.locationId) {
      throw new ForbiddenException('No tienes una sucursal asignada para habilitar productos.');
    }
    return this.productsService.enable(id, user.tenantId, user.locationId); // Service method is still 'enable'
  }

  @Post(':id/image')
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
          new FileTypeValidator({ fileType: /image\/(jpeg|png)/ }),
        ],
        fileIsRequired: true,
      }),
    ) file: Express.Multer.File,
    @User() user: UserPayload,
  ) {
    if (!user.locationId) {
      throw new ForbiddenException('No tienes una sucursal asignada.');
    }
    return this.productsService.updateImage(id, file, user.tenantId, user.locationId);
  }

  @Get(':id/ingredients')
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Kitchen)
  getIngredients(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: UserPayload,
  ) {
    if (!user.locationId) {
      throw new ForbiddenException('No tienes una sucursal asignada.');
    }
    return this.productsService.getIngredients(id, user.tenantId, user.locationId);
  }

  @Post(':id/ingredients')
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @HttpCode(HttpStatus.NO_CONTENT)
  assignIngredients(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignIngredientsDto: AssignIngredientsDto,
    @User() user: UserPayload,
  ) {
    if (!user.locationId) {
      throw new ForbiddenException('No tienes una sucursal asignada.');
    }
    return this.productsService.assignIngredients(
      id,
      assignIngredientsDto,
      user.tenantId,
      user.locationId,
    );
  }

  @Get('export')
  @Roles(RoleEnum.Admin)
  async exportProducts(@User() user: UserPayload, @Res() res: Response) {
    const csvData = await this.productsService.exportProductsToCsv(user.tenantId);
    res.header('Content-Type', 'text/csv');
    res.attachment('products.csv');
    return res.send(csvData);
  }

  @Post('import')
  @Roles(RoleEnum.Admin)
  @UseInterceptors(FileInterceptor('file'))
  async importProducts(
    @UploadedFile() file: Express.Multer.File,
    @User() user: UserPayload,
  ) {
    if (!file) {
      throw new BadRequestException('No se ha subido ningún archivo.');
    }
    // Assuming the service method is named like this
    return this.productsService.importProductsFromCsv(file, user.tenantId, user.locationId);
  }
}