import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Get,
  Query,
  Res,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles } from './decorators/roles.decorator';
import { RoleEnum } from '../roles/enums/role.enum';
import { User, UserPayload } from './decorators/user.decorator';
import { SwitchLocationDto } from './dto/switch-location.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Body() _loginDto: LoginDto) {
    // El DTO se usa para la validación automática a través del ValidationPipe.
    // El LocalAuthGuard ya ha procesado las credenciales y adjuntado el usuario a `req.user`.
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Patch('switch-location')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleEnum.Admin) // Solo los Admins pueden cambiar de sucursal
  async switchLocation(
    @User() user: UserPayload,
    @Body() switchLocationDto: SwitchLocationDto,
  ) {
    return this.authService.switchLocation(user.userId, switchLocationDto.locationId);
  }
}