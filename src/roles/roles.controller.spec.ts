import { RolesController } from './roles.controller';

enum RoleName {
  ADMIN = 'ADMIN',
}

describe('RolesController', () => {
  let controller: RolesController;
  let mockRolesService: any;

  const mockRole = {
    id: 1,
    name: RoleName.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRoles = [mockRole];

  beforeEach(async () => {
    mockRolesService = {
      findAll: jest.fn().mockResolvedValue(mockRoles),
      create: jest.fn().mockResolvedValue(mockRole),
      findById: jest.fn().mockResolvedValue(mockRole),
    };

    controller = new RolesController(mockRolesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call rolesService.findAll and return its result', async () => {
    const result = await controller.findAll();
    expect(mockRolesService.findAll).toHaveBeenCalled();
    expect(result).toEqual(mockRoles);
  });

  it('should call rolesService.findById with id and return its result', async () => {
    const result = await controller.findById('1');
    expect(mockRolesService.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockRole);
  });

  it('findAll should propagate service errors', async () => {
    mockRolesService.findAll.mockRejectedValueOnce(new Error('service error'));
    await expect(controller.findAll()).rejects.toThrow('service error');
  });

  it('findById should propagate service errors', async () => {
    mockRolesService.findById.mockRejectedValueOnce(new Error('find error'));
    await expect(controller.findById('1')).rejects.toThrow('find error');
  });
});
