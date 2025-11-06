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
  Put,
  Query,
} from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TestimonyService } from './testimony.service';
import { CreateTestimonyRequestDto, UpdateTestimonyRequestDto } from './dto';
import { PaginatedRequestDto } from 'src/common/dto/paginated-dto';

@UseGuards(JwtAuthGuard)
@Controller('testimonies')
export class TestimonyController {
  constructor(private testimonyService: TestimonyService) {}

  @Public()
  @Get('latest')
  async getLatestTestimonies(@Query() query: PaginatedRequestDto) {
    return await this.testimonyService.getLatestTestimonies(query);
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

  @Put(':id')
  async updateTestimonyItembyId(
    @Param('id') id: number,
    @Req() req,
    @Body() updatedTestimonyDto: UpdateTestimonyRequestDto,
  ) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    return await this.testimonyService.updateTestimonyItem(
      id,
      req.userId,
      updatedTestimonyDto,
    );
  }
}
