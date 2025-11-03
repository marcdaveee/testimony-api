import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto/auth-dto';
import { AuthGuard } from './guards/auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() signUpReq: SignUpDto) {
    return await this.authService.createUser(signUpReq);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async logIn(@Body() signInReq: SignInDto) {
    return await this.authService.loginUser(signInReq);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req) {
    console.log(
      `Current user -> id: ${req?.user?.userId} | email: ${req?.user?.email}`,
    );
    return req.user;
  }
}
