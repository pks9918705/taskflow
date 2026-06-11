import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/strategies/jwt.strategy';
import { TasksService } from '../tasks/tasks.service';
import { UsersService } from '../users/users.service';
import { QueryTaskDto } from '../tasks/dto/query-task.dto';

@ApiTags('Admin')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly usersService: UsersService,
  ) {}

  @Get('tasks')
  @ApiOperation({ summary: 'Get all tasks from all users (admin only)' })
  @ApiResponse({ status: 200, description: 'All tasks paginated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getAllTasks(@CurrentUser() user: AuthUser, @Query() query: QueryTaskDto) {
    return this.tasksService.getAllTasks(user.id, query, true);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiResponse({ status: 200, description: 'All users' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getAllUsers() {
    return this.usersService.findAll();
  }
}
