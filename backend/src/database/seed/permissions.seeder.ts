import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Permission } from '../../roles/entities/permission.entity';

export default class PermissionSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const repository = dataSource.getRepository(Permission);

    const permissionsData = [
      // General
      { action: 'manage', subject: 'all', conditions: null }, // Super Admin

      // Tenant Admin specific
      { action: 'manage', subject: 'locations' },
      { action: 'manage', subject: 'users' },
      { action: 'manage', subject: 'hr' },
      { action: 'manage', subject: 'settings' },
      { action: 'view', subject: 'consolidated_reports' },

      // Shared (Admin, Manager)
      { action: 'manage', subject: 'products' },
      { action: 'manage', subject: 'product_categories' },
      { action: 'manage', subject: 'promotions' },
      { action: 'manage', subject: 'preparation_zones' },
      { action: 'manage', subject: 'financials' },
      { action: 'view', subject: 'reports' },
      { action: 'manage', subject: 'cashier_session' },
      { action: 'manage', subject: 'orders' },

      // Specific Roles
      { action: 'view', subject: 'kds' },
      { action: 'manage', subject: 'dispatch' },
      { action: 'create', subject: 'orders' },
      { action: 'view', subject: 'promotions' },
    ];

    // Use "upsert" to avoid duplicates on subsequent runs
    await repository.upsert(permissionsData, ['action', 'subject']);

    console.log('✅ Permissions seeded successfully');
  }
}