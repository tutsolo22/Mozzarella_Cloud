import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User, UserStatus } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto, tenantId: string): Promise<User> {
    const { email, password, locationId, ...rest } = createUserDto;

    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      throw new ConflictException('El email ya está en uso.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      ...rest,
      email,
      password: hashedPassword,
      tenantId,
      locationId: locationId || null, // Ensure it's null if not provided
      status: UserStatus.Active, // Assume active for users created by admin
    });

    const savedUser = await this.userRepository.save(user);
    delete savedUser.password;
    return savedUser;
  }

  findAll(tenantId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { tenantId },
      relations: ['role', 'location'], // Eager load role and location
    });
  }

  async findOne(id: string, tenantId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, tenantId },
      relations: ['role', 'location'],
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }
    return user;
  }

  async findByRoles(roleNames: string[], tenantId: string, locationId?: string): Promise<User[]> {
    const where: any = {
      tenantId,
      role: { name: In(roleNames) },
    };
    if (locationId) {
      where.locationId = locationId;
    }
    return this.userRepository.find({ where, relations: ['role'] });
  }

  async update(id: string, updateUserDto: UpdateUserDto, tenantId: string): Promise<User> {
    // Allow un-assigning a location
    if (updateUserDto.hasOwnProperty('locationId') && !updateUserDto.locationId) {
      updateUserDto.locationId = null;
    }

    const user = await this.userRepository.preload({
      id,
      tenantId,
      ...updateUserDto,
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }

    const updatedUser = await this.userRepository.save(user);
    delete updatedUser.password;
    return updatedUser;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const result = await this.userRepository.delete({ id, tenantId });
    if (result.affected === 0) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    const user = await this.userRepository.preload({
      id: userId,
      ...updateProfileDto,
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID "${userId}" no encontrado.`);
    }

    const updatedUser = await this.userRepository.save(user);
    delete updatedUser.password;
    return updatedUser;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const isPasswordMatching = await bcrypt.compare(changePasswordDto.oldPassword, user.password);
    if (!isPasswordMatching) {
      throw new BadRequestException('La contraseña actual es incorrecta.');
    }

    user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.userRepository.save(user);
  }
}