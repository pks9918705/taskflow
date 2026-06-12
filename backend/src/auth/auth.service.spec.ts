import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Role } from '@prisma/client';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedpassword'),
  compare: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require('bcryptjs') as { hash: jest.Mock; compare: jest.Mock };

const mockUser = {
  id: 'user-uuid-1',
  email: 'test@example.com',
  role: Role.USER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUserWithHash = {
  ...mockUser,
  passwordHash: 'hashedpassword',
};

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock.jwt.token'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  describe('signup', () => {
    it('creates user and returns JWT token for valid data', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser);

      const result = await authService.signup({
        email: 'test@example.com',
        password: 'Password@123',
      });

      expect(result.user).toEqual(mockUser);
      expect(result.token).toBe('mock.jwt.token');
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@example.com' }),
      );
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: mockUser.id, email: mockUser.email }),
      );
    });

    it('throws ConflictException when email is already registered', async () => {
      usersService.findByEmail.mockResolvedValue(mockUserWithHash);

      await expect(
        authService.signup({ email: 'test@example.com', password: 'Password@123' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException when password is wrong', async () => {
      usersService.findByEmail.mockResolvedValue(mockUserWithHash);
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        authService.login({ email: 'test@example.com', password: 'WrongPass@123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns user and token for valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(mockUserWithHash);
      bcrypt.compare.mockResolvedValue(true);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'Password@123',
      });

      expect(result.token).toBe('mock.jwt.token');
      expect(result.user).not.toHaveProperty('passwordHash');
    });
  });
});
