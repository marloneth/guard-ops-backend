import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Prisma } from '@prisma/client';

@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.rolesService.findById(+id);
  }
}
