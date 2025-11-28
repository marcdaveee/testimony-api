import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ILoginResponseDto, SignInDto, SignUpDto } from './dto/auth-dto';
import { PrismaService } from 'src/prisma/prisma.service';

import * as argon2 from 'argon2';

import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

export interface JwtPayload {
  userId: number | string;

  email: string;
}

@Injectable()
export class AuthService {
  private accessTokenExpiry = 60 * 2; // 2 mins temporarily. Will be switched to 15 mins
  private refreshTokenExpiry = 60 * 60 * 24 * 7; // 7 days

  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
    private userService: UsersService,
  ) {}

  async createUser(newUser: SignUpDto): Promise<ILoginResponseDto> {
    const isExist = await this.prisma.user.findFirst({
      where: {
        email: { equals: newUser.email },
      },
    });

    if (isExist) {
      throw new BadRequestException(['email already in use']);
    }

    const hashedPass = await argon2.hash(newUser.password);

    const user = await this.prisma.user.create({
      data: {
        email: newUser.email,
        password: hashedPass,
        createDate: new Date(),
      },
    });

    const accessToken = await this.generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = await this.generateRefreshToken({ userId: user.id });

    return {
      access_token: accessToken,
      access_token_expires_in: this.accessTokenExpiry, // will be set to 15 mins soon
      refresh_token: refreshToken,
      refresh_token_expires_in: this.refreshTokenExpiry, // 7 days
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async loginUser(signinDto: SignInDto): Promise<ILoginResponseDto> {
    const userAcc = await this.prisma.user.findFirst({
      where: {
        email: signinDto.email,
      },
    });

    if (!userAcc) {
      throw new UnauthorizedException('Account not found');
    }

    const result = await this.validatePassword(
      signinDto.password,
      userAcc.password,
    );

    if (!result) {
      throw new UnauthorizedException({
        message: [
          'email: incorrect email or password',
          'password: incorrect email or password',
        ],
      });
    }

    const accessToken = await this.generateAccessToken({
      userId: userAcc.id,
      email: userAcc.email,
    });

    const refreshToken = await this.generateRefreshToken({
      userId: userAcc.id,
    });

    return {
      access_token: accessToken,
      access_token_expires_in: this.accessTokenExpiry, // will be set to 15 mins soon
      refresh_token: refreshToken,
      refresh_token_expires_in: this.refreshTokenExpiry, // 7 days
      user: {
        id: userAcc.id,
        email: userAcc.email,
      },
    };
  }

  async refreshTokenAsync(refreshToken: string): Promise<ILoginResponseDto> {
    const payload = await this.jwtService.verifyAsync(refreshToken);
    const user = await this.userService.getUserProfileById(payload.sub);

    if (!payload || !user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = await this.generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const newRefreshToken = await this.generateRefreshToken({
      userId: user.id,
    });

    return {
      access_token: accessToken,
      access_token_expires_in: this.accessTokenExpiry, // will be set to 15 mins soon
      refresh_token: newRefreshToken,
      refresh_token_expires_in: this.refreshTokenExpiry,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async generateAccessToken(payload: JwtPayload) {
    return await this.jwtService.signAsync(
      {
        sub: payload.userId,
        userId: payload.userId,
        username: payload.email,
        email: payload.email,
      },
      { expiresIn: '2m' },
    );
  }

  async generateRefreshToken(payload: { userId: number | string }) {
    return this.jwtService.signAsync(
      {
        sub: payload.userId,
      },
      { expiresIn: '7d' },
    );
  }

  async validatePassword(input: string, hashedPassword: string) {
    return await argon2.verify(hashedPassword, input);
  }
}
