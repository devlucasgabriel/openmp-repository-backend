import { MigrationInterface, QueryRunner } from "typeorm";

export class DirectiveGompTable1780339915683 implements MigrationInterface {
    name = 'DirectiveGompTable1780339915683'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "directive_gomp_function" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "directive_id" integer NOT NULL, "gomp_function_id" integer NOT NULL, CONSTRAINT "PK_4ca4a60daaee7bddb5892901a47" PRIMARY KEY ("directive_id", "gomp_function_id"))`);
        await queryRunner.query(`ALTER TABLE "directive_gomp_function" ADD CONSTRAINT "FK_57c3a9ccf9c4ac11a8236abd7b7" FOREIGN KEY ("directive_id") REFERENCES "directive"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "directive_gomp_function" ADD CONSTRAINT "FK_e8dc01b63e8dda5c39eff9266f1" FOREIGN KEY ("gomp_function_id") REFERENCES "function"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "directive_gomp_function" DROP CONSTRAINT "FK_e8dc01b63e8dda5c39eff9266f1"`);
        await queryRunner.query(`ALTER TABLE "directive_gomp_function" DROP CONSTRAINT "FK_57c3a9ccf9c4ac11a8236abd7b7"`);
        await queryRunner.query(`DROP TABLE "directive_gomp_function"`);
    }

}
