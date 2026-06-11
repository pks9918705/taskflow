import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { TasksService } from './tasks.service';
import { ActivityService } from '../activity/activity.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/strategies/jwt.strategy';

@ApiTags('Tasks')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly activityService: ActivityService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all tasks (paginated, filtered, sorted)' })
  @ApiResponse({ status: 200, description: 'Paginated task list' })
  getAllTasks(@CurrentUser() user: AuthUser, @Query() query: QueryTaskDto) {
    return this.tasksService.getAllTasks(user.id, query, user.role === Role.ADMIN);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created' })
  createTask(@CurrentUser() user: AuthUser, @Body() dto: CreateTaskDto) {
    return this.tasksService.createTask(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiResponse({ status: 200, description: 'Task found' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  getTaskById(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.tasksService.getTaskById(user.id, id, user.role === Role.ADMIN);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task by ID' })
  @ApiResponse({ status: 200, description: 'Task updated' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  updateTask(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task by ID' })
  @ApiResponse({ status: 200, description: 'Task deleted' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  deleteTask(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.tasksService.deleteTask(user.id, id);
  }

  @Get(':id/activity')
  @ApiOperation({ summary: 'Get activity log for a task' })
  @ApiResponse({ status: 200, description: 'Activity logs' })
  getTaskActivity(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.activityService.getTaskActivity(id);
  }
}
