import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto/auth-dto';

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
}
