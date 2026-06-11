import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from './user.model';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async create(data: { email: string; passwordHash: string; role?: Role }): Promise<User> {
    return this.usersRepository.create(data);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }
}
