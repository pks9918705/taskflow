import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { TaskPriority, TaskStatus } from '@prisma/client';

export type SortByField = 'dueDate' | 'priority' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export class QueryTaskDto {
  @ApiPropertyOptional({ default: '1' })
  @IsOptional()
  @IsNumberString()
  page?: string = '1';

  @ApiPropertyOptional({ default: '10' })
  @IsOptional()
  @IsNumberString()
  limit?: string = '10';

  @ApiPropertyOptional({ enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({ description: 'Search by title' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ['dueDate', 'priority', 'createdAt'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsEnum(['dueDate', 'priority', 'createdAt'])
  sortBy?: SortByField = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: SortOrder = 'desc';
}
