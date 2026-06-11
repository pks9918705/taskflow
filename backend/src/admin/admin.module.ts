import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { TasksModule } from '../tasks/tasks.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TasksModule, UsersModule],
  controllers: [AdminController],
})
export class AdminModule {}
