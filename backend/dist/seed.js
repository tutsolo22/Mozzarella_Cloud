"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const user_entity_1 = require("./users/entities/user.entity");
const role_entity_1 = require("./roles/entities/role.entity");
const user_entity_2 = require("./users/entities/user.entity");
const role_enum_1 = require("./roles/enums/role.enum");
const bcrypt = require("bcrypt");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const dataSource = app.get(typeorm_1.DataSource);
    if (!dataSource.isInitialized) {
        console.error('❌ Error: No se pudo inicializar la conexión con la base de datos. Verifica tus variables de entorno en el archivo .env');
        await app.close();
        process.exit(1);
    }
    console.log('✅ Conexión con la base de datos establecida correctamente.');
    const configService = app.get(config_1.ConfigService);
    console.log('🌱 Iniciando el proceso de seeding...');
    console.log('⏳ Forzando la sincronización del esquema (creando tablas si no existen)...');
    await dataSource.synchronize();
    console.log('✅ Esquema sincronizado.');
    const userRepository = app.get((0, typeorm_2.getRepositoryToken)(user_entity_1.User));
    const roleRepository = app.get((0, typeorm_2.getRepositoryToken)(role_entity_1.Role));
    console.log('Verificando y creando roles base...');
    for (const roleName of Object.values(role_enum_1.RoleEnum)) {
        let role = await roleRepository.findOne({ where: { name: roleName } });
        if (!role) {
            console.log(`Creando el rol: ${roleName}`);
            role = roleRepository.create({ name: roleName });
            await roleRepository.save(role);
        }
    }
    const superAdminRole = await roleRepository.findOne({ where: { name: role_enum_1.RoleEnum.SuperAdmin } });
    const superAdminEmail = configService.get('SUPER_ADMIN_EMAIL');
    const superAdminPassword = configService.get('SUPER_ADMIN_PASSWORD');
    const existingSuperAdmin = await userRepository.findOne({
        where: { email: superAdminEmail },
    });
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
        console.log(`✅ Usuario Super Admin creado con éxito con el estado: ${superAdminUser.status}.`);
    }
    await app.close();
    console.log('🌱 Proceso de seeding finalizado.');
}
bootstrap();
//# sourceMappingURL=seed.js.map