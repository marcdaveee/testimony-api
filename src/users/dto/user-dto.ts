import { IsDate, IsDateString, IsNotEmpty } from 'class-validator';

export class User {
  userId: number;
  email: string;
}

export class UserResponseDto {
  id: number;
  userName?: string;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  country: string;
}

export class CreateProfileRequestDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  country: string;

  @IsNotEmpty()
  @IsDateString()
  birthDate: Date;
}

export class updateProfileRequestDto extends CreateProfileRequestDto {}
