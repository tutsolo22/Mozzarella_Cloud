"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const bcrypt = require("bcrypt");
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
const askQuestion = (query) => {
    return new Promise(resolve => rl.question(query, resolve));
};
async function bootstrap() {
    console.log('⚡ Iniciando script para resetear contraseña del Super Admin...');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    try {
        const configService = app.get(config_1.ConfigService);
        const userRepository = app.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
        const superAdminEmail = configService.get('SUPER_ADMIN_EMAIL');
        if (!superAdminEmail) {
            throw new Error('SUPER_ADMIN_EMAIL no está definido en tu archivo .env');
        }
        const user = await userRepository.findOneBy({ email: superAdminEmail });
        if (!user) {
            throw new Error(`No se encontró al super admin con el email: ${superAdminEmail}`);
        }
        console.log(`🔑 Se encontró al Super Admin: ${user.fullName} (${user.email})`);
        const newPassword = await askQuestion('Introduce la nueva contraseña para el Super Admin: ');
        if (newPassword.length < 8) {
            throw new Error('La contraseña debe tener al menos 8 caracteres.');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.status = user_entity_1.UserStatus.Active;
        await userRepository.save(user);
        console.log('✅ ¡Contraseña del Super Admin actualizada con éxito!');
    }
    catch (error) {
        console.error('🔥 Ocurrió un error durante el proceso:', error.message);
    }
    finally {
        rl.close();
        await app.close();
        process.exit(0);
    }
}
bootstrap();
//# sourceMappingURL=reset-super-admin-password.js.map