import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateProfileRequestDto,
  updateProfileRequestDto,
  UserResponseDto,
} from './dto';
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

  async getUserProfileById(userId: number): Promise<UserResponseDto> {
    const profile = await this.prisma.profile.findFirst({
      include: {
        user: {
          select: {
            id: true,
            userName: true,
            email: true,
          },
        },
      },
      where: {
        userId: userId,
      },
    });

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    const mappedToDtoObj: UserResponseDto = {
      id: profile.user.id,
      userName: profile.user.userName || undefined,
      email: profile.user.email,
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      address: profile?.address || '',
      country: profile?.country || '',
    };

    return mappedToDtoObj;
  }

  async createUserProfile(request: CreateProfileRequestDto, userId: number) {
    // Check if already have initial profile
    const hasProfile = await this.prisma.profile.findFirst({
      where: {
        userId: userId,
      },
    });

    if (hasProfile) {
      throw new BadRequestException('Profile already exists.');
    }

    const newProfile = await this.prisma.profile.create({
      data: {
        userId: userId,
        firstName: request.firstName,
        lastName: request.lastName,
        birthDate: request.birthDate,
        address: request.address,
        country: request.country,
        createDate: new Date(),
      },
    });

    // return the profile data
    return newProfile;
  }

  async updateUserProfile(request: updateProfileRequestDto, userId: number) {
    // Check if already have initial profile
    const hasProfile = await this.prisma.profile.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!hasProfile) {
      throw new BadRequestException('Profile was not found.');
    }

    const updatedProfile = await this.prisma.profile.update({
      where: {
        userId: userId,
      },
      data: {
        userId: userId,
        firstName: request.firstName,
        lastName: request.lastName,
        birthDate: request.birthDate,
        address: request.address,
        country: request.country,
        updateDate: new Date(),
      },
    });

    // return the profile data
    return updatedProfile;
  }
}
