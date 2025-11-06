import { IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { SortBy } from '../enum/sort-by.enum';
import { Type } from 'class-transformer';

export class PaginatedResponseDto<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class PaginatedRequestDto {
  @IsOptional()
  searchTerm?: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  pageIndex: number = 1;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  pageSize: number = 10;

  @IsEnum(SortBy)
  @IsOptional()
  sortBy?: SortBy;

  @IsOptional()
  orderBy?: string;
}
