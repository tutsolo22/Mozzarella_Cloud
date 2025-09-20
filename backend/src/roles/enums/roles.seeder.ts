import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { RoleEnum } from './role.enum';

export default class RoleSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const roleRepository = dataSource.getRepository(Role);
    const permissionRepository = dataSource.getRepository(Permission);

    const allPermissions = await permissionRepository.find();

    const findPerm = (action: string, subject: string) =>
      allPermissions.find(p => p.action === action && p.subject === subject);

    const rolesToSeed = [
      {
        name: RoleEnum.SuperAdmin,
        permissions: [findPerm('manage', 'all')],
      },
      {
        name: RoleEnum.Admin,
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
        ].filter(Boolean), // Filter out any undefined if a perm isn't found
      },
      {
        name: RoleEnum.Manager,
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
      { name: RoleEnum.Kitchen, permissions: [findPerm('view', 'kds')] },
      { name: RoleEnum.Delivery, permissions: [findPerm('manage', 'dispatch')] },
      {
        name: RoleEnum.Cashier,
        permissions: [
          findPerm('create', 'orders'),
          findPerm('view', 'promotions'),
          findPerm('manage', 'cashier_session'),
        ].filter(Boolean),
      },
      // ElectronicCashier can have same permissions as Cashier for now
      { name: RoleEnum.ElectronicCashier, permissions: [findPerm('create', 'orders'), findPerm('view', 'promotions'), findPerm('manage', 'cashier_session')].filter(Boolean) },
      { name: RoleEnum.Customer, permissions: [] },
    ];

    for (const roleData of rolesToSeed) {
      const existingRole = await roleRepository.findOne({ where: { name: roleData.name } });
      if (!existingRole) {
        const newRole = roleRepository.create(roleData);
        await roleRepository.save(newRole);
      }
    }

    console.log('✅ Roles seeded successfully');
  }
}