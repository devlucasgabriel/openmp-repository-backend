import { MigrationInterface, QueryRunner } from "typeorm";

export class OpenmpAdjust1779863444117 implements MigrationInterface {
    name = 'OpenmpAdjust1779863444117'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "directive" DROP COLUMN "regex"`);
        await queryRunner.query(`ALTER TABLE "open_mp" ADD "pdf_url" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "open_mp" ADD CONSTRAINT "UQ_027211bc5f1d6f919b61ced41dc" UNIQUE ("pdf_url")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "open_mp" DROP CONSTRAINT "UQ_027211bc5f1d6f919b61ced41dc"`);
        await queryRunner.query(`ALTER TABLE "open_mp" DROP COLUMN "pdf_url"`);
        await queryRunner.query(`ALTER TABLE "directive" ADD "regex" character varying NOT NULL`);
    }

}
