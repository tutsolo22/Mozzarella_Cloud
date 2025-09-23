"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv_1 = require("dotenv");
const path_1 = require("path");
(0, dotenv_1.config)({ path: (0, path_1.join)(__dirname, '..', '..', '.env'), override: true });
const permissions_seeder_1 = require("./database/seed/permissions.seeder");
const roles_seeder_1 = require("./database/seed/roles.seeder");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./users/entities/user.entity");
const role_entity_1 = require("./roles/entities/role.entity");
const user_entity_2 = require("./users/entities/user.entity");
const role_enum_1 = require("./roles/enums/role.enum");
const bcrypt = require("bcrypt");
const typeorm_extension_1 = require("typeorm-extension");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    console.log('✅ Contexto de la aplicación NestJS creado.');
    try {
        const dataSource = app.get(typeorm_2.DataSource);
        if (!dataSource.isInitialized) {
            throw new Error('DataSource no está inicializado. Verifica la conexión a la BD en AppModule.');
        }
        console.log('🌱 Ejecutando seeders de Permisos y Roles...');
        await (0, typeorm_extension_1.runSeeders)(dataSource, {
            seeds: [permissions_seeder_1.default, roles_seeder_1.default],
        });
        console.log('✅ Seeders de Permisos y Roles finalizados.');
        const configService = app.get(config_1.ConfigService);
        const userRepository = app.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
        const roleRepository = app.get((0, typeorm_1.getRepositoryToken)(role_entity_1.Role));
        const superAdminRole = await roleRepository.findOne({ where: { name: role_enum_1.RoleEnum.SuperAdmin } });
        if (!superAdminRole) {
            throw new Error('El rol SuperAdmin no fue encontrado. Asegúrate de que el RoleSeeder se ejecutó correctamente.');
        }
        const superAdminEmail = configService.get('SUPER_ADMIN_EMAIL');
        const superAdminPassword = configService.get('SUPER_ADMIN_PASSWORD');
        if (!superAdminEmail || !superAdminPassword) {
            throw new Error('SUPER_ADMIN_EMAIL y SUPER_ADMIN_PASSWORD deben estar definidos en tu archivo .env');
        }
        const existingSuperAdmin = await userRepository.findOne({ where: { email: superAdminEmail } });
        if (existingSuperAdmin) {
            console.log('✅ El usuario Super Admin ya existe. No se requiere ninguna acción.');
        }
        else {
            console.log('Creando el usuario Super Admin...');
            const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
            const superAdminUser = userRepository.create({
                email: superAdminEmail,
                password: hashedPassword,
                fullName: 'Super Admin',
                role: superAdminRole,
                status: user_entity_2.UserStatus.Active,
            });
            await userRepository.save(superAdminUser);
            console.log(`✅ Usuario Super Admin creado con éxito.`);
        }
    }
    catch (error) {
        console.error('🔥 Ocurrió un error durante el proceso de seeding:', error);
        process.exit(1);
    }
    finally {
        await app.close();
        console.log('🌱 Proceso de seeding finalizado.');
    }
}
bootstrap();
//# sourceMappingURL=seed.js.map