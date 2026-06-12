import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Task, TaskPriority, TaskStatus } from '@prisma/client';
import { SortByField, SortOrder } from './dto/query-task.dto';

interface FindAllOptions {
  userId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  sortBy?: SortByField;
  sortOrder?: SortOrder;
  page: number;
  limit: number;
}

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options: FindAllOptions): Promise<{ tasks: Task[]; total: number }> {
    const {
      userId,
      status,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page,
      limit,
    } = options;

    const where = {
      ...(userId ? { userId } : {}),
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(search ? { title: { contains: search, mode: 'insensitive' as const } } : {}),
    };

    const [tasks, total] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.task.count({ where }),
    ]);

    return { tasks, total };
  }

  async findById(id: string): Promise<Task | null> {
    return this.prisma.task.findUnique({ where: { id } });
  }

  async create(userId: string, data: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string;
  }): Promise<Task> {
    return this.prisma.task.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        status: data.status ?? TaskStatus.PENDING,
        priority: data.priority ?? TaskPriority.MEDIUM,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
    });
  }

  async update(id: string, data: {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string;
  }): Promise<Task> {
    return this.prisma.task.update({
      where: { id },
      data: {
        ...data,
        dueDate: data.dueDate !== undefined
          ? (data.dueDate ? new Date(data.dueDate) : null)
          : undefined,
      },
    });
  }

  async delete(id: string): Promise<Task> {
    return this.prisma.task.delete({ where: { id } });
  }
}
