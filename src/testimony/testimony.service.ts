import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CreateTestimonyRequestDto,
  TestimonyResponseDto,
  UpdateTestimonyRequestDto,
} from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginatedRequestDto, PaginatedResponseDto } from 'src/common/dto';
import { Prisma } from '@prisma/client';
import { UserResponseDto } from 'src/users/dto';

@Injectable()
export class TestimonyService {
  constructor(private prisma: PrismaService) {}
  async createTestimony(
    newTestimony: CreateTestimonyRequestDto,
    userId: number,
  ) {
    const testimonyLimit = 7;
    // Check if user can still post a testimony
    const userTestimonyCount = await this.prisma.testimony.count({
      where: {
        userId: userId,
      },
    });

    const isLimit = userTestimonyCount == testimonyLimit;

    if (isLimit) {
      throw new HttpException(
        'Sorry, testimony posting limit reached.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Post the new testimony
    // Todo: Confirm by moderator before publishing!
    const postedTestimony = await this.prisma.testimony.create({
      data: {
        title: newTestimony.title,
        content: newTestimony.content,
        createDate: new Date(),
        userId: userId,
        isApproved: false,
      },
    });

    return postedTestimony;
  }

  async getLatestTestimonies(
    query: PaginatedRequestDto,
  ): Promise<PaginatedResponseDto<TestimonyResponseDto>> {
    const filters: Prisma.TestimonyWhereInput = {};

    if (query.searchTerm) {
      filters.OR = [
        {
          title: {
            contains: query.searchTerm,
          },
        },
        {
          content: {
            contains: query.searchTerm,
          },
        },
      ];
    }

    filters.AND = [
      {
        isApproved: true,
      },
      { isDeleted: false },
    ];

    const pageSize = query.pageSize;
    const pageIndex = query.pageIndex;
    const pageToSkip = (pageIndex - 1) * pageSize;

    // Execute prisma queries in parallel
    const [latestTestimonies, totalItems] = await Promise.all([
      // Get testimony records
      this.prisma.testimony.findMany({
        where: filters,
        select: {
          id: true,
          title: true,
          content: true,
          createDate: true,
          updateDate: true,
          user: {
            select: {
              id: true,
              email: true,
              userName: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  address: true,
                  country: true,
                },
              },
            },
          },
        },
        skip: pageToSkip,
        take: pageSize,
        orderBy: {
          createDate: 'desc',
        },
      }),

      // get count
      this.prisma.testimony.count({
        where: filters,
      }),
    ]);

    const mappedToDtoObj = latestTestimonies.map((testimony) => {
      const testimonyDto: TestimonyResponseDto = {
        id: testimony.id,
        title: testimony.title,
        content: testimony.content,
        userId: testimony.user.id,
        user: {
          id: testimony.user.id,
          email: testimony.user.email,
          userName: testimony.user.userName || '',
          firstName: testimony.user?.profile?.firstName || '',
          lastName: testimony.user?.profile?.lastName || '',
          address: testimony.user?.profile?.address || '',
          country: testimony.user?.profile?.country || '',
        },
        createDate: testimony.createDate,
        updateDate: testimony.updateDate,
      };

      return testimonyDto;
    });

    const totalPages = Math.ceil(totalItems / pageSize);

    const paginatedResponse: PaginatedResponseDto<TestimonyResponseDto> = {
      items: mappedToDtoObj,
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
      totalPages: totalPages,
      hasNext: totalPages > pageIndex,
      hasPrev: pageIndex > 1,
    };

    return paginatedResponse;
  }

  async getTestimoniesByUserId(userId: number) {
    const testimonies = await this.prisma.testimony.findMany({
      where: {
        AND: [{ isApproved: true }, { userId: userId }, { isDeleted: false }],
      },
      include: {
        user: {
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
        },
      },
    });

    return testimonies;
  }

  async getTestimonyDetailsById(testimonyId: number) {
    const testimonyDetails = await this.prisma.testimony.findFirst({
      where: {
        AND: [{ id: testimonyId }, { isApproved: true }, { isDeleted: false }],
      },
      include: {
        user: {
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
        },
      },
    });

    if (!testimonyDetails) {
      throw new NotFoundException('Testimony detail was not found');
    }

    const mappedToDtoObj = Object.assign(
      TestimonyResponseDto,
      testimonyDetails,
    );

    return mappedToDtoObj;
  }

  async updateTestimonyItem(
    testimonyId: number,
    userId: number,
    updatedTestimony: UpdateTestimonyRequestDto,
  ) {
    const testimonyItemToUpdate = await this.prisma.testimony.findFirst({
      where: {
        id: testimonyId,
      },
    });

    if (!testimonyItemToUpdate) {
      throw new NotFoundException('Testimony item to update was not found');
    }

    if (testimonyItemToUpdate.id != updatedTestimony.id) {
      throw new BadRequestException();
    }

    if (testimonyItemToUpdate.userId != userId) {
      throw new UnauthorizedException(
        'You are unauthorized to update this testimony',
      );
    }

    const updatedData = await this.prisma.testimony.update({
      data: {
        title: updatedTestimony.title,
        content: updatedTestimony.content,
        updateDate: new Date(),
        isApproved: false,
      },
      where: {
        id: testimonyId,
      },
    });

    const mappedToDtoObj = Object.assign(TestimonyResponseDto, updatedData);

    return mappedToDtoObj;
  }
}
