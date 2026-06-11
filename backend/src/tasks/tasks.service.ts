import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Task } from '@prisma/client';
import { TasksRepository } from './tasks.repository';
import { ActivityService } from '../activity/activity.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';

export interface PaginatedTasks {
  data: Task[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly activityService: ActivityService,
  ) {}

  async getAllTasks(userId: string, query: QueryTaskDto, isAdmin: boolean): Promise<PaginatedTasks> {
    const page = parseInt(query.page ?? '1', 10);
    const limit = parseInt(query.limit ?? '10', 10);

    const { tasks, total } = await this.tasksRepository.findAll({
      userId: isAdmin ? undefined : userId,
      status: query.status,
      priority: query.priority,
      search: query.search,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      page,
      limit,
    });

    return {
      data: tasks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTaskById(userId: string, taskId: string, isAdmin: boolean): Promise<Task> {
    const task = await this.tasksRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    if (!isAdmin && task.userId !== userId) {
      throw new ForbiddenException('You do not have access to this task');
    }
    return task;
  }

  async createTask(userId: string, dto: CreateTaskDto): Promise<Task> {
    const task = await this.tasksRepository.create(userId, dto);
    await this.activityService.log(task.id, userId, 'CREATED');
    return task;
  }

  async updateTask(userId: string, taskId: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.tasksRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    if (task.userId !== userId) {
      throw new ForbiddenException('You do not have access to this task');
    }

    const changes: Record<string, { from: unknown; to: unknown }> = {};
    for (const key of Object.keys(dto) as (keyof UpdateTaskDto)[]) {
      if (dto[key] !== undefined && dto[key] !== task[key as keyof Task]) {
        changes[key] = { from: task[key as keyof Task], to: dto[key] };
      }
    }

    const updated = await this.tasksRepository.update(taskId, dto);
    await this.activityService.log(taskId, userId, 'UPDATED', changes);
    return updated;
  }

  async deleteTask(userId: string, taskId: string): Promise<Task> {
    const task = await this.tasksRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    if (task.userId !== userId) {
      throw new ForbiddenException('You do not have access to this task');
    }

    const deleted = await this.tasksRepository.delete(taskId);
    await this.activityService.log(taskId, userId, 'DELETED');
    return deleted;
  }
}
