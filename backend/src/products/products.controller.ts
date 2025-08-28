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

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(RoleEnum.Admin)
  create(@Body() createProductDto: CreateProductDto, @User() user: UserPayload) {
    return this.productsService.create(createProductDto, user.tenantId);
  }

  @Get()
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Kitchen)
  findAll(@User() user: UserPayload) {
    return this.productsService.findAll(user.tenantId);
  }

  @Get(':id')
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Kitchen)
  findOne(@Param('id', ParseUUIDPipe) id: string, @User() user: UserPayload) {
    return this.productsService.findOne(id, user.tenantId);
  }

  @Patch(':id')
  @Roles(RoleEnum.Admin)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @User() user: UserPayload,
  ) {
    return this.productsService.update(id, updateProductDto, user.tenantId);
  }

  @Delete(':id')
  @Roles(RoleEnum.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @User() user: UserPayload) {
    return this.productsService.remove(id, user.tenantId);
  }

  @Post(':id/image')
  @Roles(RoleEnum.Admin)
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
    return this.productsService.updateProductImage(id, user.tenantId, file);
  }

  @Get(':id/ingredients')
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Kitchen)
  getIngredients(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: UserPayload,
  ) {
    return this.productsService.getIngredients(id, user.tenantId);
  }

  @Post(':id/ingredients')
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @HttpCode(HttpStatus.NO_CONTENT)
  assignIngredients(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignIngredientsDto: AssignIngredientsDto,
    @User() user: UserPayload,
  ) {
    return this.productsService.assignIngredients(id, assignIngredientsDto, user.tenantId);
  }
}