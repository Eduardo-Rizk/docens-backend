import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.subject.findMany({
      select: {
        id: true,
        name: true,
        icon: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}
