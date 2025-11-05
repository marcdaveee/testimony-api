import { isEmpty, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { UserResponseDto } from 'src/users/dto';

export class TestimonyResponseDto {
  id: number;
  title: string;
  content: string;
  userId: number;
  user: UserResponseDto;
  createDate: Date;
  updateDate?: Date | null;
}

export class CreateTestimonyRequestDto {
  @IsString()
  @MaxLength(1000)
  @IsNotEmpty()
  title: string;

  @IsString()
  @MaxLength(1000)
  @IsNotEmpty()
  content: string;
}

export class UpdateTestimonyRequestDto extends CreateTestimonyRequestDto {
  id: number;
}
