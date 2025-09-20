import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
export default class PermissionSeeder implements Seeder {
    run(dataSource: DataSource): Promise<any>;
}
