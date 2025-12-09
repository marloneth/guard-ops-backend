import { NotFoundException } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { RolesService } from './roles.service';

describe('RolesService', () => {
  let service: RolesService;
  let mockPrismaService: any;

  beforeEach(() => {
    jest.resetAllMocks();

    mockPrismaService = {
      role: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    service = new RolesService(mockPrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      const mockRoles = [
        { id: 1, name: RoleName.ADMIN },
        { id: 2, name: RoleName.GUARD },
      ];

      mockPrismaService.role.findMany.mockResolvedValueOnce(mockRoles);

      const result = await service.findAll();

      expect(mockPrismaService.role.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockRoles);
    });

    it('should return empty array when no roles exist', async () => {
      mockPrismaService.role.findMany.mockResolvedValueOnce([]);

      const result = await service.findAll();

      expect(mockPrismaService.role.findMany).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a new role', async () => {
      const createData = { name: RoleName.SUPERVISOR };
      const mockRole = { id: 3, name: RoleName.SUPERVISOR };

      mockPrismaService.role.create.mockResolvedValueOnce(mockRole);

      const result = await service.create(createData);

      expect(mockPrismaService.role.create).toHaveBeenCalledWith({
        data: createData,
      });
      expect(result).toEqual(mockRole);
    });

    it('should propagate errors when prisma create fails', async () => {
      const createData = { name: RoleName.ADMIN };
      const error = new Error('Database error');

      mockPrismaService.role.create.mockRejectedValueOnce(error);

      await expect(service.create(createData)).rejects.toThrow(
        'Database error',
      );
      expect(mockPrismaService.role.create).toHaveBeenCalledWith({
        data: createData,
      });
    });
  });

  describe('findById', () => {
    it('should return role when found', async () => {
      const mockRole = { id: 1, name: RoleName.ADMIN };

      mockPrismaService.role.findUnique.mockResolvedValueOnce(mockRole);

      const result = await service.findById(1);

      expect(mockPrismaService.role.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockRole);
    });

    it('should throw NotFoundException when role not found', async () => {
      mockPrismaService.role.findUnique.mockResolvedValueOnce(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.role.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });

    it('should propagate database errors', async () => {
      const error = new Error('Database connection failed');
      mockPrismaService.role.findUnique.mockRejectedValueOnce(error);

      await expect(service.findById(1)).rejects.toThrow(
        'Database connection failed',
      );
      expect(mockPrismaService.role.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
