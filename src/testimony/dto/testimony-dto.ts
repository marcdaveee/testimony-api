import { isEmpty, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class TestimonyResponseDto {
  id: number;
  title: string;
  content: string;
  userId: number;
  createDate: Date;
  updateDate?: Date | null;
  isApproved: boolean;
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
