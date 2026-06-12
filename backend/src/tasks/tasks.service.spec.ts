import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';
import { ActivityService } from '../activity/activity.service';
import { TaskPriority, TaskStatus } from '@prisma/client';

const makeTask = (overrides: Partial<{
  id: string;
  userId: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
}> = {}) => ({
  id: 'task-uuid-1',
  userId: 'user-uuid-1',
  title: 'Test Task',
  description: null,
  status: TaskStatus.PENDING,
  priority: TaskPriority.MEDIUM,
  dueDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('TasksService', () => {
  let tasksService: TasksService;
  let tasksRepository: jest.Mocked<TasksRepository>;
  let activityService: jest.Mocked<ActivityService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: TasksRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: ActivityService,
          useValue: {
            log: jest.fn().mockResolvedValue({}),
            getTaskActivity: jest.fn(),
          },
        },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
    tasksRepository = module.get(TasksRepository);
    activityService = module.get(ActivityService);
  });

  describe('getTaskById', () => {
    it('throws ForbiddenException when user tries to access another users task', async () => {
      tasksRepository.findById.mockResolvedValue(makeTask({ userId: 'other-user-uuid' }));

      await expect(
        tasksService.getTaskById('user-uuid-1', 'task-uuid-1', false),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when task does not exist', async () => {
      tasksRepository.findById.mockResolvedValue(null);

      await expect(
        tasksService.getTaskById('user-uuid-1', 'nonexistent', false),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns task when user is owner', async () => {
      const task = makeTask();
      tasksRepository.findById.mockResolvedValue(task);

      const result = await tasksService.getTaskById('user-uuid-1', 'task-uuid-1', false);
      expect(result).toEqual(task);
    });
  });

  describe('createTask', () => {
    it('creates task with the correct userId', async () => {
      const task = makeTask();
      tasksRepository.create.mockResolvedValue(task);

      const result = await tasksService.createTask('user-uuid-1', {
        title: 'Test Task',
      });

      expect(result.userId).toBe('user-uuid-1');
      expect(tasksRepository.create).toHaveBeenCalledWith(
        'user-uuid-1',
        expect.objectContaining({ title: 'Test Task' }),
      );
    });
  });

  describe('updateTask', () => {
    it('logs activity with correct diff when task is updated', async () => {
      const existing = makeTask({ status: TaskStatus.PENDING });
      const updated = makeTask({ status: TaskStatus.IN_PROGRESS });
      tasksRepository.findById.mockResolvedValue(existing);
      tasksRepository.update.mockResolvedValue(updated);

      await tasksService.updateTask('user-uuid-1', 'task-uuid-1', {
        status: TaskStatus.IN_PROGRESS,
      });

      expect(activityService.log).toHaveBeenCalledWith(
        'task-uuid-1',
        'user-uuid-1',
        'UPDATED',
        expect.objectContaining({
          status: { from: TaskStatus.PENDING, to: TaskStatus.IN_PROGRESS },
        }),
      );
    });

    it('throws ForbiddenException when non-owner tries to update', async () => {
      tasksRepository.findById.mockResolvedValue(makeTask({ userId: 'other-user' }));

      await expect(
        tasksService.updateTask('user-uuid-1', 'task-uuid-1', { title: 'New Title' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
