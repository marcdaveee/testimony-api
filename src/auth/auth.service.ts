import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInDto, SignUpDto } from './dto/auth-dto';
import { PrismaService } from 'src/prisma/prisma.service';

import * as argon2 from 'argon2';

import { JwtService } from '@nestjs/jwt';

export interface JwtPayload {
  userId: number | string;

  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async createUser(newUser: SignUpDto) {
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
      access_token_expires_in: 60 * 2, // will be set to 15 mins soon
      refresh_token: refreshToken,
      refresh_token_expires_in: 60 * 60 * 24 * 7, // 7 days
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async loginUser(signinDto: SignInDto) {
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
      access_token_expires_in: 60 * 2, // will be set to 15 mins soon
      refresh_token: refreshToken,
      refresh_token_expires_in: 60 * 60 * 24 * 7, // 7 days
      user: {
        id: userAcc.id,
        email: userAcc.email,
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
