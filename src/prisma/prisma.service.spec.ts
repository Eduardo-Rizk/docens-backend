import { PrismaService } from './prisma.service';
import { PrismaClient } from '@prisma/client';

describe('PrismaService', () => {
  it('can be instantiated', () => {
    const service = new PrismaService();
    expect(service).toBeDefined();
  });

  it('extends PrismaClient', () => {
    const service = new PrismaService();
    expect(service).toBeInstanceOf(PrismaClient);
  });
});
