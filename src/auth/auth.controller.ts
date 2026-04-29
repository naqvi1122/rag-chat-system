import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user and return a JWT' })
  register(@Body() dto: AuthDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and return a JWT' })
  login(@Body() dto: AuthDto) {
    return this.auth.login(dto);
  }
}
