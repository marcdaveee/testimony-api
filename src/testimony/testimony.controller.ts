import {
  Body,
  Controller,
  Get,
  Request,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TestimonyService } from './testimony.service';
import { CreateTestimonyRequestDto } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('testimonies')
export class TestimonyController {
  constructor(private testimonyService: TestimonyService) {}

  @Public()
  @Get('latest')
  async getLatestTestimonies() {
    return await this.testimonyService.getLatestTestimonies();
  }

  @Post('create')
  async createNewTestimony(@Request() requestDto: CreateTestimonyRequestDto) {
    if (!requestDto.user) {
      throw new UnauthorizedException();
    }

    return await this.testimonyService.createTestimony(
      requestDto,
      requestDto.user.id,
    );
  }
}
