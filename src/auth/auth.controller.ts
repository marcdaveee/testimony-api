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
import { Public } from './decorators/public.decorator';

@UseGuards(JwtAuthGuard)
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

  @Get('me')
  getMe(@Request() req) {
    if (req.user) {
      console.log(
        `Current user -> id: ${req?.user?.userId} | email: ${req?.user?.email}`,
      );
    }
    return req.user;
  }
}
