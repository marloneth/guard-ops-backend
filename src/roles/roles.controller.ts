import { Controller, Get, Param } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../auth/constants/permissions.constants';

@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Permissions(PERMISSIONS.USER.CREATE, PERMISSIONS.USER.UPDATE)
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Permissions(PERMISSIONS.USER.CREATE, PERMISSIONS.USER.UPDATE)
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.rolesService.findById(+id);
  }
}
