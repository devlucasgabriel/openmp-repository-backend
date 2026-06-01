import {
	BeforeInsert,
	BeforeUpdate,
	CreateDateColumn,
	DeleteDateColumn,
	UpdateDateColumn
} from 'typeorm'

export abstract class DefaultEntity<T> {
	@CreateDateColumn()
	created_at: Date

	@UpdateDateColumn()
	updated_at: Date

	@DeleteDateColumn({ nullable: true, select: false })
	deleted_at: Date | null

	constructor(data: Partial<T>) {
		Object.assign(this, data)
	}

	@BeforeInsert()
	beforeInsert(): void {
		this.created_at = this.created_at || new Date()
		this.updated_at = new Date()
	}

	@BeforeUpdate()
	beforeUpdate(): void {
		this.updated_at = new Date()
	}
}
