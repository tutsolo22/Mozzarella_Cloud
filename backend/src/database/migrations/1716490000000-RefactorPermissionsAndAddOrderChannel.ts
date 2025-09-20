import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorPermissionsAndAddOrderChannel1716490000000
  implements MigrationInterface
{
  name = 'RefactorPermissionsAndAddOrderChannel1716490000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- 1. Añadir la columna 'channel' a la tabla 'orders' ---
    await queryRunner.query(
      `CREATE TYPE "public"."orders_channel_enum" AS ENUM('in_store', 'phone', 'whatsapp', 'web')`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "channel" "public"."orders_channel_enum" NOT NULL DEFAULT 'in_store'`,
    );

    // --- 2. Reconstruir la tabla 'permissions' y su tabla de unión ---
    // ADVERTENCIA: Este es un cambio destructivo para los permisos existentes.
    // Se deben volver a ejecutar los seeders después de la migración.
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "permissions"`);

    // Crear la nueva tabla 'permissions'
    await queryRunner.query(`
      CREATE TABLE "permissions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "action" character varying NOT NULL,
        "subject" character varying NOT NULL,
        "conditions" jsonb,
        CONSTRAINT "PK_920331560282b8441d040ab84b5" PRIMARY KEY ("id"),
        CONSTRAINT "IDX_permissions_action_subject" UNIQUE ("action", "subject")
      )
    `);

    // Volver a crear la tabla de unión 'role_permissions'
    await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "role_id" uuid NOT NULL,
        "permission_id" uuid NOT NULL,
        CONSTRAINT "PK_170349b31851433a30511b34e61" PRIMARY KEY ("role_id", "permission_id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_role_permissions_role_id" ON "role_permissions" ("role_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_role_permissions_permission_id" ON "role_permissions" ("permission_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_permission" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir los cambios en el orden inverso
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    // Aquí se podría recrear la tabla de permisos antigua si fuera necesario,
    // pero para este refactor, asumimos que avanzamos.

    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "channel"`);
    await queryRunner.query(`DROP TYPE "public"."orders_channel_enum"`);
  }
}