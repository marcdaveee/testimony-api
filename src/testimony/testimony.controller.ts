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
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@ApiTags('testimonies')
@Controller('testimonies')
export class TestimonyController {
  constructor(private testimonyService: TestimonyService) {}

  @Public()
  @Get('latest')
  async getLatestTestimonies(@Query() query: PaginatedRequestDto) {
    return await this.testimonyService.getLatestTestimonies(query);
  }

  @Get(':id')
  async getTestimonyDetailById(@Param('id') id: number) {
    return await this.testimonyService.getTestimonyDetailsById(id);
  }

  @Post()
  async createNewTestimony(
    @Body() createTestimonyDto: CreateTestimonyRequestDto,
    @CurrentUser() user,
  ) {
    if (!user) {
      throw new UnauthorizedException();
    }

    return await this.testimonyService.createTestimony(
      createTestimonyDto,
      user.userId,
    );
  }

  @Put(':id')
  async updateTestimonyItembyId(
    @Param('id') id: number,
    @CurrentUser() user,
    @Body() updatedTestimonyDto: UpdateTestimonyRequestDto,
  ) {
    if (!user) {
      throw new UnauthorizedException();
    }

    return await this.testimonyService.updateTestimonyItem(
      id,
      user.userId,
      updatedTestimonyDto,
    );
  }

  @Get('users/:userId')
  async getTestimoniesByUserId(@Param('userId') userId: number) {
    return await this.testimonyService.getTestimoniesByUserId(userId);
  }
}
