import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../auth/constants/permissions.constants';
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';

@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @UseGuards(JwtAccessGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.USER.CREATE, PERMISSIONS.USER.UPDATE)
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @UseGuards(JwtAccessGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.USER.CREATE, PERMISSIONS.USER.UPDATE)
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.rolesService.findById(+id);
  }
}
