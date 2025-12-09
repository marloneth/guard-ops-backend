import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.role.findMany();
  }

  async create(data: Prisma.RoleCreateInput) {
    return this.prisma.role.create({
      data,
    });
  }

  async findById(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) throw new NotFoundException('Role not found');

    return role;
  }
}
