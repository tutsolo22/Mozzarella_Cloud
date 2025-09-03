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
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/enums/role.enum';
import { User, UserPayload } from '../auth/decorators/user.decorator';
import { FilesService } from '../files/files.service';
import * as path from 'path';

@Controller('promotions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.Admin, RoleEnum.Manager)
export class PromotionsController {
  constructor(
    private readonly promotionsService: PromotionsService,
    private readonly filesService: FilesService,
  ) {}

  @Post()
  create(@Body() createPromotionDto: CreatePromotionDto, @User() user: UserPayload) {
    return this.promotionsService.create(createPromotionDto, user.tenantId);
  }

  @Get()
  findAll(@User() user: UserPayload) {
    return this.promotionsService.findAll(user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @User() user: UserPayload) {
    return this.promotionsService.findOne(id, user.tenantId);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updatePromotionDto: UpdatePromotionDto, @User() user: UserPayload) {
    return this.promotionsService.update(id, updatePromotionDto, user.tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @User() user: UserPayload) {
    return this.promotionsService.remove(id, user.tenantId);
  }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }), // 2MB
          new FileTypeValidator({ fileType: 'image/jpeg|image/png' }),
        ],
      }),
    ) file: Express.Multer.File,
    @User() user: UserPayload,
  ) {
    const filename = `promotion-${id}${path.extname(file.originalname)}`;
    const imageUrl = await this.filesService.uploadPublicFile(file.buffer, filename, `promotions/${user.tenantId}`);
    return this.promotionsService.update(id, { imageUrl }, user.tenantId);
  }
}