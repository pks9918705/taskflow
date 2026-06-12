import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.model';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto): Promise<{ user: User; token: string }> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.usersService.create({ email: dto.email, passwordHash });
    const token = this.signToken({ sub: user.id, email: user.email, role: user.role });

    return { user, token };
  }

  async login(dto: LoginDto): Promise<{ user: User; token: string }> {
    const userWithHash = await this.usersService.findByEmail(dto.email);
    if (!userWithHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, userWithHash.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { passwordHash: _, ...user } = userWithHash;
    const token = this.signToken({ sub: user.id, email: user.email, role: user.role });

    return { user, token };
  }

  signToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }
}
