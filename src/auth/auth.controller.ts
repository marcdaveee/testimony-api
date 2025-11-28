import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto/auth-dto';
import { AuthGuard } from './guards/auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

@UseGuards(JwtAuthGuard)
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() signUpReq: SignUpDto) {
    return await this.authService.createUser(signUpReq);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async logIn(@Body() signInReq: SignInDto) {
    return await this.authService.loginUser(signInReq);
  }

  @Post('refresh-token')
  async refreshToken(@Req() req: Request) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const [type, refreshToken] = authHeader.split(' ');

    console.log(`Type: ${type} | val: ${refreshToken}`);
    return await this.authService.refreshTokenAsync(refreshToken);
  }

  @Get('me')
  getMe(@Req() req) {
    if (req.user) {
      console.log(
        `Current user -> id: ${req?.user?.userId} | email: ${req?.user?.email}`,
      );
    }
    return req.user;
  }
}
