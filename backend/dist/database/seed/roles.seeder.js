"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const role_entity_1 = require("../../roles/entities/role.entity");
const permission_entity_1 = require("../../roles/entities/permission.entity");
const role_enum_1 = require("../../roles/enums/role.enum");
class RoleSeeder {
    async run(dataSource) {
        const roleRepository = dataSource.getRepository(role_entity_1.Role);
        const permissionRepository = dataSource.getRepository(permission_entity_1.Permission);
        const allPermissions = await permissionRepository.find();
        const findPerm = (action, subject) => allPermissions.find(p => p.action === action && p.subject === subject);
        const rolesToSeed = [
            {
                name: role_enum_1.RoleEnum.SuperAdmin,
                permissions: [findPerm('manage', 'all')],
            },
            {
                name: role_enum_1.RoleEnum.Admin,
                permissions: [
                    findPerm('manage', 'locations'),
                    findPerm('manage', 'users'),
                    findPerm('manage', 'hr'),
                    findPerm('manage', 'settings'),
                    findPerm('view', 'consolidated_reports'),
                    findPerm('manage', 'products'),
                    findPerm('manage', 'product_categories'),
                    findPerm('manage', 'promotions'),
                    findPerm('manage', 'preparation_zones'),
                    findPerm('manage', 'financials'),
                    findPerm('view', 'reports'),
                    findPerm('manage', 'cashier_session'),
                    findPerm('manage', 'orders'),
                    findPerm('view', 'kds'),
                    findPerm('manage', 'dispatch'),
                ].filter(Boolean),
            },
            {
                name: role_enum_1.RoleEnum.Manager,
                permissions: [
                    findPerm('manage', 'products'),
                    findPerm('manage', 'product_categories'),
                    findPerm('manage', 'promotions'),
                    findPerm('manage', 'preparation_zones'),
                    findPerm('manage', 'financials'),
                    findPerm('view', 'reports'),
                    findPerm('manage', 'cashier_session'),
                    findPerm('manage', 'orders'),
                    findPerm('view', 'kds'),
                    findPerm('manage', 'dispatch'),
                ].filter(Boolean),
            },
            { name: role_enum_1.RoleEnum.Kitchen, permissions: [findPerm('view', 'kds')] },
            { name: role_enum_1.RoleEnum.Delivery, permissions: [findPerm('manage', 'dispatch')] },
            {
                name: role_enum_1.RoleEnum.Cashier,
                permissions: [
                    findPerm('create', 'orders'),
                    findPerm('view', 'promotions'),
                    findPerm('manage', 'cashier_session'),
                ].filter(Boolean),
            },
            { name: role_enum_1.RoleEnum.ElectronicCashier, permissions: [findPerm('create', 'orders'), findPerm('view', 'promotions'), findPerm('manage', 'cashier_session')].filter(Boolean) },
            { name: role_enum_1.RoleEnum.Customer, permissions: [] },
        ];
        for (const roleData of rolesToSeed) {
            let role = await roleRepository.findOne({ where: { name: roleData.name } });
            if (!role) {
                console.log(`Creating role: ${roleData.name}`);
                role = roleRepository.create({ name: roleData.name });
            }
            role.permissions = roleData.permissions.filter(Boolean);
            await roleRepository.save(role);
        }
        console.log('✅ Roles and permissions associations updated successfully');
    }
}
exports.default = RoleSeeder;
//# sourceMappingURL=roles.seeder.js.map