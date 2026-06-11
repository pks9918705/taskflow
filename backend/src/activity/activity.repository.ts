import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLog } from '@prisma/client';

@Injectable()
export class ActivityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    taskId: string,
    userId: string,
    action: string,
    changes?: Record<string, unknown>,
  ): Promise<ActivityLog> {
    return this.prisma.activityLog.create({
      data: {
        taskId,
        userId,
        action,
        changes: changes ? (changes as Prisma.InputJsonValue) : undefined,
      },
    });
  }

  async findByTaskId(taskId: string): Promise<ActivityLog[]> {
    return this.prisma.activityLog.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
