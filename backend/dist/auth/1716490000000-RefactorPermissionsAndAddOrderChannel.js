"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefactorPermissionsAndAddOrderChannel1716490000000 = void 0;
class RefactorPermissionsAndAddOrderChannel1716490000000 {
    constructor() {
        this.name = 'RefactorPermissionsAndAddOrderChannel1716490000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."orders_channel_enum" AS ENUM('in_store', 'phone', 'whatsapp', 'web')`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "channel" "public"."orders_channel_enum" NOT NULL DEFAULT 'in_store'`);
        await queryRunner.query(`DROP TABLE "role_permissions"`);
        await queryRunner.query(`DROP TABLE "permissions"`);
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
        await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "role_id" uuid NOT NULL,
        "permission_id" uuid NOT NULL,
        CONSTRAINT "PK_170349b31851433a30511b34e61" PRIMARY KEY ("role_id", "permission_id")
      )
    `);
        await queryRunner.query(`CREATE INDEX "IDX_role_permissions_role_id" ON "role_permissions" ("role_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_role_permissions_permission_id" ON "role_permissions" ("permission_id") `);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_permission" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "role_permissions"`);
        await queryRunner.query(`DROP TABLE "permissions"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "channel"`);
        await queryRunner.query(`DROP TYPE "public"."orders_channel_enum"`);
    }
}
exports.RefactorPermissionsAndAddOrderChannel1716490000000 = RefactorPermissionsAndAddOrderChannel1716490000000;
//# sourceMappingURL=1716490000000-RefactorPermissionsAndAddOrderChannel.js.map