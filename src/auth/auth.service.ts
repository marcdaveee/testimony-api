import {
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

  async createUser(newUser: SignUpDto): Promise<{ access_token: string }> {
    const isExist = await this.prisma.user.findFirst({
      where: {
        email: { equals: newUser.email },
      },
    });

    if (isExist) {
      throw new HttpException('email already in use', HttpStatus.BAD_REQUEST);
    }

    const hashedPass = await argon2.hash(newUser.password);

    const user = await this.prisma.user.create({
      data: {
        email: newUser.email,
        password: hashedPass,
        createDate: new Date(),
      },
    });

    const accessToken = await this.generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      access_token: accessToken,
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

    const token = await this.generateToken({
      userId: userAcc.id,
      email: userAcc.email,
    });

    return {
      access_token: token,
      user: {
        id: userAcc.id,
        email: userAcc.email,
      },
    };
  }

  async generateToken(payload: JwtPayload) {
    return await this.jwtService.signAsync({
      sub: payload.userId,
      userId: payload.userId,
      username: payload.email,
      email: payload.email,
    });
  }

  async validatePassword(input: string, hashedPassword: string) {
    return await argon2.verify(hashedPassword, input);
  }
}
