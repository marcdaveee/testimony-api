import {
  Body,
  Controller,
  Get,
  Request,
  Post,
  UnauthorizedException,
  UseGuards,
  Req,
  Param,
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
  async createNewTestimony(
    @Body() createTestimonyDto: CreateTestimonyRequestDto,
    @Req() request,
  ) {
    if (!request.user) {
      throw new UnauthorizedException();
    }

    return await this.testimonyService.createTestimony(
      createTestimonyDto,
      request.user.id,
    );
  }

  @Get('users/:userId')
  async getTestimoniesByUserId(@Param('userId') userId: number) {
    return await this.testimonyService.getTestimoniesByUserId(userId);
  }

  @Get(':id')
  async getTestimonyDetailById(@Param('id') id: number) {
    return await this.testimonyService.getTestimonyDetailsById(id);
  }
}
