import { Module } from '@nestjs/common';
import { TasksRepository } from './tasks.repository';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [ActivityModule],
  controllers: [TasksController],
  providers: [TasksRepository, TasksService],
  exports: [TasksService],
})
export class TasksModule {}
