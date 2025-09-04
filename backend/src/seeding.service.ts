import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './users/entities/user.entity';
import { Role } from './roles/entities/role.entity';
import { RoleEnum } from './roles/enums/role.enum';

@Injectable()
export class SeedingService {
  private readonly logger = new Logger(SeedingService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async seed() {
    this.logger.log('Iniciando el sembrado (seeding) de la base de datos...');
    await this.seedRoles();
    await this.seedSuperAdmin();
    this.logger.log('Sembrado de la base de datos finalizado.');
  }

  private async seedRoles() {
    const rolesToSeed = Object.values(RoleEnum).map((roleName) => ({
      name: roleName,
    }));

    for (const roleData of rolesToSeed) {
      const roleExists = await this.roleRepository.findOneBy({ name: roleData.name });
      if (!roleExists) {
        const newRole = this.roleRepository.create(roleData);
        await this.roleRepository.save(newRole);
        this.logger.log(`Rol "${roleData.name}" creado.`);
      }
    }
  }

  private async seedSuperAdmin() {
    const superAdminEmail = 'tutsolo22@gmail.com';
    const userExists = await this.userRepository.findOneBy({ email: superAdminEmail });

    if (userExists) {
      this.logger.log('El usuario SuperAdmin ya existe. Omitiendo.');
      return;
    }

    const superAdminRole = await this.roleRepository.findOneBy({ name: RoleEnum.SuperAdmin });
    if (!superAdminRole) {
      this.logger.error('Rol SuperAdmin no encontrado. No se puede crear el usuario SuperAdmin.');
      return;
    }

    const hashedPassword = await bcrypt.hash('Passsword', 10);

    const superAdmin = this.userRepository.create({
      email: superAdminEmail,
      password: hashedPassword,
      fullName: 'Super Admin',
      role: superAdminRole,
    });

    await this.userRepository.save(superAdmin);
    this.logger.log(`Usuario SuperAdmin "${superAdminEmail}" creado exitosamente.`);
  }
}