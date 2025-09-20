"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const permission_entity_1 = require("../../roles/entities/permission.entity");
class PermissionSeeder {
    async run(dataSource) {
        const repository = dataSource.getRepository(permission_entity_1.Permission);
        const permissionsData = [
            { action: 'manage', subject: 'all', conditions: null },
            { action: 'manage', subject: 'locations' },
            { action: 'manage', subject: 'users' },
            { action: 'manage', subject: 'hr' },
            { action: 'manage', subject: 'settings' },
            { action: 'view', subject: 'consolidated_reports' },
            { action: 'manage', subject: 'products' },
            { action: 'manage', subject: 'product_categories' },
            { action: 'manage', subject: 'promotions' },
            { action: 'manage', subject: 'preparation_zones' },
            { action: 'manage', subject: 'financials' },
            { action: 'view', subject: 'reports' },
            { action: 'manage', subject: 'cashier_session' },
            { action: 'manage', subject: 'orders' },
            { action: 'view', subject: 'kds' },
            { action: 'manage', subject: 'dispatch' },
            { action: 'create', subject: 'orders' },
            { action: 'view', subject: 'promotions' },
        ];
        await repository.upsert(permissionsData, ['action', 'subject']);
        console.log('✅ Permissions seeded successfully');
    }
}
exports.default = PermissionSeeder;
//# sourceMappingURL=permissions.seeder.js.map