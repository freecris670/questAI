import { Controller, Post, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto';

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Авторизация пользователя' })
  @ApiResponse({ status: 200, description: 'Успешная авторизация', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Неверные учетные данные' })
  async login(@Body() loginDto: LoginDto, @Req() request: Request): Promise<AuthResponseDto> {
    // Получаем IP-адрес из заголовков
    let ipAddress = request.headers['x-forwarded-for'];
    if (Array.isArray(ipAddress)) {
      ipAddress = ipAddress[0];
    }
    const remoteAddress = request.connection?.remoteAddress || '127.0.0.1';
    const ip = ipAddress as string || remoteAddress;

    return this.authService.login(loginDto, ip);
  }

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь успешно создан', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: 'Ошибка при регистрации' })
  async register(@Body() registerDto: RegisterDto, @Req() request: Request): Promise<AuthResponseDto> {
    // Получаем IP-адрес из заголовков
    let ipAddress = request.headers['x-forwarded-for'];
    if (Array.isArray(ipAddress)) {
      ipAddress = ipAddress[0];
    }
    const remoteAddress = request.connection?.remoteAddress || '127.0.0.1';
    const ip = ipAddress as string || remoteAddress;
    
    return this.authService.register(registerDto, ip);
  }
}
