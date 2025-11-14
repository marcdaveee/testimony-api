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
  firstName: string;
  lastName: string;
  address: string;
  country: string;
  birthDate: Date;
}

export class updateProfileRequestDto extends CreateProfileRequestDto {}
