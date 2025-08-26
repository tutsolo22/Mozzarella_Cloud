import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const user = this.usersRepository.create({
      ...userData,
      passwordHash,
    });

    return this.usersRepository.save(user);
  }

  findAll() {
    return this.usersRepository.find({ relations: ['role'] });
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({ where: { id }, relations: ['role'] });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email }, relations: ['role'] });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { password, ...userData } = updateUserDto;
    const user = await this.usersRepository.preload({
      id: id,
      ...userData,
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    if (password) {
      const salt = await bcrypt.genSalt();
      user.passwordHash = await bcrypt.hash(password, salt);
    }

    return this.usersRepository.save(user);
  }

  async remove(id: string) {
    // Reutilizamos findOne para asegurarnos de que el usuario existe.
    // Si no existe, findOne arrojará un NotFoundException.
    const user = await this.findOne(id);
    return this.usersRepository.remove(user);
  }
}