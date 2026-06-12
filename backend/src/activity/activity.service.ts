import { Injectable } from '@nestjs/common';
import { ActivityLog } from '@prisma/client';
import { ActivityRepository } from './activity.repository';

@Injectable()
export class ActivityService {
  constructor(private readonly activityRepository: ActivityRepository) {}

  async log(
    taskId: string,
    userId: string,
    action: string,
    changes?: Record<string, unknown>,
  ): Promise<ActivityLog> {
    return this.activityRepository.create(taskId, userId, action, changes);
  }

  async getTaskActivity(taskId: string): Promise<ActivityLog[]> {
    return this.activityRepository.findByTaskId(taskId);
  }
}
