import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthCheckService, MongooseHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;
  let mongooseHealthIndicator: MongooseHealthIndicator;
  let memoryHealthIndicator: MemoryHealthIndicator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn().mockImplementation((checks) => {
              return Promise.resolve({
                status: 'ok',
                info: {
                  mongodb: { status: 'up' },
                  memory_heap: { status: 'up' },
                  memory_rss: { status: 'up' },
                },
                error: {},
                details: {
                  mongodb: { status: 'up' },
                  memory_heap: { status: 'up' },
                  memory_rss: { status: 'up' },
                },
              });
            }),
          },
        },
        {
          provide: MongooseHealthIndicator,
          useValue: {
            pingCheck: jest.fn().mockImplementation((key, options) => {
              return Promise.resolve({
                [key]: { status: 'up' },
              });
            }),
          },
        },
        {
          provide: MemoryHealthIndicator,
          useValue: {
            checkHeap: jest.fn().mockImplementation((key, threshold) => {
              return Promise.resolve({
                [key]: { status: 'up' },
              });
            }),
            checkRSS: jest.fn().mockImplementation((key, threshold) => {
              return Promise.resolve({
                [key]: { status: 'up' },
              });
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    mongooseHealthIndicator = module.get<MongooseHealthIndicator>(MongooseHealthIndicator);
    memoryHealthIndicator = module.get<MemoryHealthIndicator>(MemoryHealthIndicator);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return the health check result', async () => {
      const result = await controller.check();
      
      expect(result).toEqual({
        status: 'ok',
        info: {
          mongodb: { status: 'up' },
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' },
        },
        error: {},
        details: {
          mongodb: { status: 'up' },
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' },
        },
      });
      
      expect(healthCheckService.check).toHaveBeenCalled();
      expect(mongooseHealthIndicator.pingCheck).toHaveBeenCalledWith('mongodb');
      expect(memoryHealthIndicator.checkHeap).toHaveBeenCalledWith('memory_heap', 300 * 1024 * 1024);
      expect(memoryHealthIndicator.checkRSS).toHaveBeenCalledWith('memory_rss', 300 * 1024 * 1024);
    });
  });

  describe('liveness', () => {
    it('should return the liveness check result', async () => {
      const result = await controller.liveness();
      
      expect(result).toEqual({
        status: 'ok',
        info: {
          mongodb: { status: 'up' },
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' },
        },
        error: {},
        details: {
          mongodb: { status: 'up' },
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' },
        },
      });
      
      expect(healthCheckService.check).toHaveBeenCalled();
      expect(memoryHealthIndicator.checkHeap).toHaveBeenCalledWith('memory_heap', 500 * 1024 * 1024);
    });
  });

  describe('readiness', () => {
    it('should return the readiness check result', async () => {
      const result = await controller.readiness();
      
      expect(result).toEqual({
        status: 'ok',
        info: {
          mongodb: { status: 'up' },
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' },
        },
        error: {},
        details: {
          mongodb: { status: 'up' },
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' },
        },
      });
      
      expect(healthCheckService.check).toHaveBeenCalled();
      expect(mongooseHealthIndicator.pingCheck).toHaveBeenCalledWith('mongodb', { timeout: 3000 });
    });
  });
});