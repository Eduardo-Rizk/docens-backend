import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('PrismaService');

  constructor() {
    super({
      log:
        process.env.NODE_ENV !== 'production'
          ? [{ emit: 'event', level: 'query' }]
          : [],
    });
  }

  async onModuleInit() {
    if (process.env.NODE_ENV !== 'production') {
      (this as any).$on('query', (e: any) => {
        if (e.duration > 100) {
          this.logger.warn(`Slow query (${e.duration}ms): ${e.query}`);
        }
      });
    }
    await this.$connect();
  }
}
