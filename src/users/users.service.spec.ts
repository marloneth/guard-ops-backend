import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let mockPrismaService: any;

  beforeEach(() => {
    jest.resetAllMocks();

    mockPrismaService = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    service = new UsersService(mockPrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'admin@test.com',
          firstName: 'Admin',
          lastName: 'User',
          roleId: 1,
        },
        {
          id: 'user-2',
          email: 'guard@test.com',
          firstName: 'Guard',
          lastName: 'User',
          roleId: 3,
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValueOnce(mockUsers);

      const result = await service.findAll();

      expect(mockPrismaService.user.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array when no users exist', async () => {
      mockPrismaService.user.findMany.mockResolvedValueOnce([]);

      const result = await service.findAll();

      expect(mockPrismaService.user.findMany).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findByEmail', () => {
    it('should return user when found by email', async () => {
      const email = 'test@example.com';
      const mockUser = {
        id: 'user-1',
        email,
        firstName: 'Test',
        lastName: 'User',
        roleId: 1,
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);

      const result = await service.findByEmail(email);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by email', async () => {
      const email = 'nonexistent@example.com';

      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      const result = await service.findByEmail(email);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toBeNull();
    });

    it('should propagate database errors', async () => {
      const email = 'test@example.com';
      const error = new Error('Database connection failed');

      mockPrismaService.user.findUnique.mockRejectedValueOnce(error);

      await expect(service.findByEmail(email)).rejects.toThrow(
        'Database connection failed',
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createData = {
        email: 'newuser@test.com',
        firstName: 'New',
        lastName: 'User',
        passwordHash: 'hashed-password',
        role: { connect: { id: 2 } },
      };
      const mockUser = {
        id: 'user-3',
        email: 'newuser@test.com',
        firstName: 'New',
        lastName: 'User',
        passwordHash: 'hashed-password',
        roleId: 2,
      };

      mockPrismaService.user.create.mockResolvedValueOnce(mockUser);

      const result = await service.create(createData);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: createData,
      });
      expect(result).toEqual(mockUser);
    });

    it('should propagate errors when prisma create fails', async () => {
      const createData = {
        email: 'duplicate@test.com',
        firstName: 'Duplicate',
        lastName: 'User',
        passwordHash: 'hashed-password',
        role: { connect: { id: 1 } },
      };
      const error = new Error('Unique constraint failed');

      mockPrismaService.user.create.mockRejectedValueOnce(error);

      await expect(service.create(createData)).rejects.toThrow(
        'Unique constraint failed',
      );
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: createData,
      });
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const userId = 'user-1';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        roleId: 1,
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);

      const result = await service.findById(userId);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = 'nonexistent-user';

      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      await expect(service.findById(userId)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should propagate database errors', async () => {
      const userId = 'user-1';
      const error = new Error('Database connection failed');

      mockPrismaService.user.findUnique.mockRejectedValueOnce(error);

      await expect(service.findById(userId)).rejects.toThrow(
        'Database connection failed',
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });
});
