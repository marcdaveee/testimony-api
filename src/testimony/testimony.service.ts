import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTestimonyRequestDto, TestimonyResponseDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TestimonyService {
  constructor(private prisma: PrismaService) {}
  async createTestimony(
    newTestimony: CreateTestimonyRequestDto,
    userId: number,
  ): Promise<TestimonyResponseDto> {
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

  async getLatestTestimonies(): Promise<TestimonyResponseDto[]> {
    const latestTestimonies = await this.prisma.testimony.findMany({
      where: {
        AND: [{ isApproved: true }, { isDeleted: false }],
      },
      include: {
        user: {},
      },
      orderBy: {
        createDate: 'desc',
      },
    });

    return latestTestimonies;
  }
}
