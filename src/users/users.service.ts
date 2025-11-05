import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserResponseDto } from './dto';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUsers(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        userName: true,
        email: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            address: true,
            country: true,
          },
        },
      },
    });

    return users.map((user) => {
      const mappedToDtoObj: UserResponseDto = {
        id: user.id,
        userName: user.userName || undefined,
        email: user.email,
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        address: user.profile?.address || '',
        country: user.profile?.country || '',
      };

      return mappedToDtoObj;
    });
  }

  async getUserProfile(userId: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findFirst({
      select: {
        id: true,
        userName: true,
        email: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            address: true,
            country: true,
          },
        },
      },
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    const mappedToDtoObj: UserResponseDto = {
      id: user.id,
      userName: user.userName || undefined,
      email: user.email,
      firstName: user.profile?.firstName || '',
      lastName: user.profile?.lastName || '',
      address: user.profile?.address || '',
      country: user.profile?.country || '',
    };

    return mappedToDtoObj;
  }
}
