import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';
import { getModelToken } from '@nestjs/mongoose';
import { CreateUserDto } from './dto';
import { BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let model: jest.Mocked<Model<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: {
            // put mock functions here to ensure it is reset between tests
            create: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
          },
        }
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'user1',
        passwordHash: "hashedpassword123",
      }
      const mockUser: User = {
        _id: new Types.ObjectId(),
        ...createUserDto,
      };
      model.create.mockResolvedValue(mockUser as any);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(model.create).toHaveBeenCalledWith(createUserDto);
    })
  });

  describe('findByUsername', () => {
    it('should return a user if found', async () => {
      const mockUser: User = { 
        _id: new Types.ObjectId(),
        username: 'user1',
        passwordHash: "hashedpassword123" 
      };
      model.findOne.mockResolvedValue(mockUser);

      const result = await service.findByUsername('user1');
      expect(result).toEqual(mockUser);
      expect(model.findOne).toHaveBeenCalledWith({ username: 'user1' });
    });

    it('should return undefined if user not found', async () => {
      model.findOne.mockResolvedValue(undefined);

      const result = await service.findByUsername('nonexistentuser');
      expect(result).toBeUndefined();
      expect(model.findOne).toHaveBeenCalledWith({ username: 'nonexistentuser' });
    });
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      const mockUser: User = { 
        _id: new Types.ObjectId(),
        username: 'user1',
        passwordHash: "hashedpassword123" 
      };
      model.findById.mockResolvedValue(mockUser as User);

      const result = await service.findById(mockUser._id.toHexString());
      expect(result).toEqual(mockUser);
      expect(model.findById).toHaveBeenCalledWith(mockUser._id.toHexString());
    });

    it('should throw BadRequestException if id is invalid', async () => {
      const invalidId = 'invalid-id';

      await expect(service.findById(invalidId)).rejects.toThrow(BadRequestException);
      expect(model.findById).not.toHaveBeenCalled();
    });

    it('should return undefined if user not found', async () => {
      const validId = new Types.ObjectId().toHexString();
      model.findById.mockResolvedValue(undefined);

      const result = await service.findById(validId);
      expect(result).toBeUndefined();
      expect(model.findById).toHaveBeenCalledWith(validId);
    });
  });
});
