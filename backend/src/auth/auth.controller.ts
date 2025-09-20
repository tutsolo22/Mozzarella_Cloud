import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles } from './decorators/roles.decorator';
import { RoleEnum } from '../roles/enums/role.enum';
import { User, UserPayload } from './decorators/user.decorator';
import { SwitchLocationDto } from './dto/switch-location.dto';
import { SetupAccountDto } from './dto/setup-account.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Body() _loginDto: LoginDto) {
    // El DTO se usa para la validación automática a través del ValidationPipe.
    // El LocalAuthGuard ya ha procesado las credenciales y adjuntado el usuario a `req.user`.
    return this.authService.login(req.user);
  }

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body() body: { email: string }) {
    // La lógica en el servicio ya maneja el caso de que el email no exista
    // para no filtrar información.
    await this.authService.requestPasswordReset(body.email);
    return {
      message:
        'Si tu correo está registrado, recibirás un enlace para resetear tu contraseña en unos minutos.',
    };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: { token: string; password: string }) {
    await this.authService.resetPassword(body.token, body.password);
    return { message: 'Contraseña actualizada con éxito.' };
  }

  @Public()
  @Post('setup-account')
  @HttpCode(HttpStatus.OK)
  async setupAccount(@Body() setupAccountDto: SetupAccountDto) {
    return this.authService.setupAccount(setupAccountDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@User() user: UserPayload) {
    // The JwtAuthGuard has already validated the token.
    // The @User() decorator extracts the user payload.
    // We just need to fetch the full user details to send back to the client.
    return this.authService.getProfile(user.userId);
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