import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { CreateProfileRequestDto, updateProfileRequestDto, User } from './dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  /* Profile Endpoints */
  @Public()
  @Get('profile/:id')
  async getProfileByUserId(@Param('id') id: number) {
    return await this.userService.getUserProfileById(id);
  }

  @Get('profile/me')
  async getMyProfile(@CurrentUser() user: User) {
    if (!user) {
      throw new UnauthorizedException();
    }
    return await this.userService.getUserProfileById(user.userId);
  }

  @Post('profile')
  async createProfile(
    @Body() createProfileRequestDto: CreateProfileRequestDto,
    @CurrentUser() user: User,
  ) {
    if (!user) {
      throw new UnauthorizedException();
    }

    return await this.userService.createUserProfile(
      createProfileRequestDto,
      user.userId,
    );
  }

  @Put('profile')
  async updateProfile(
    @Body() updateProfileRequest: updateProfileRequestDto,
    @Req() req,
  ) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    return await this.userService.updateUserProfile(
      updateProfileRequest,
      req.user.userId,
    );
  }
}
