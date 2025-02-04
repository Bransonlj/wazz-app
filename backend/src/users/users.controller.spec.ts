import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { Types } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByUsername: jest.fn(),
          },
        }
      ]
    }).compile();

    controller = module.get(UsersController);
    service = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findByUsername', () => {
    it('should call UsersService.findByUsername with the correct username', async () => {
      const user: User = { 
        _id: new Types.ObjectId(), 
        username: "user123",
        passwordHash: "hashpassword123"
      };
      service.findByUsername.mockResolvedValue(user);

      const result = await controller.findByUsername({ username: user.username });

      expect(service.findByUsername).toHaveBeenCalledWith(user.username);
      expect(result).toEqual(user);
    });
  });

  describe('findById', () => {
    it('should return the user if found', async () => {
      const id = "id123";
      const user: User = { 
        _id: new Types.ObjectId(), 
        username: "user123",
        passwordHash: "hashpassword123"
      };
      service.findById.mockResolvedValue(user);

      const result = await controller.findById(id);

      expect(service.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const id = "id123";
      service.findById.mockResolvedValue(null);

      await expect(controller.findById(id)).rejects.toThrow(NotFoundException);
      expect(service.findById).toHaveBeenCalledWith(id);
    });
  });
});
