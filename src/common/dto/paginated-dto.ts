import { IsEnum } from 'class-validator/types/decorator/decorators';
import { SortBy } from '../enum/sort-by.enum';

export class PaginatedResponseDto<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class PaginatedRequestDto {
  searchTerm?: string;

  pageIndex: number;

  pageSize: number;

  @IsEnum(SortBy)
  sortBy: SortBy;

  orderBy?: string;
}
