import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { ActivityModule } from './activity/activity.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [ConfigModule, PrismaModule, UsersModule, AuthModule, TasksModule, ActivityModule, AdminModule],
})
export class AppModule {}
