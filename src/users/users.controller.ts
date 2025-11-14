import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { CreateProfileRequestDto, updateProfileRequestDto, User } from './dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Console } from 'console';

@UseGuards(JwtAuthGuard)
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  /*** Profile Endpoints ***/

  //  Get own profile -> /users/me/profile
  @Get('me/profile')
  async getMyProfile(@Request() req) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    return await this.userService.getUserProfileById(req.user.userId);
  }

  @Public()
  @Get(':id/profile')
  async getProfileByUserId(@Param('id') id: number) {
    return await this.userService.getUserProfileById(id);
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
    @Request() req,
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
