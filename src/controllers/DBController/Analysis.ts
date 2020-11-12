import { DBAnalysis } from 'ea-core-gpi-pi';
import { container } from 'tsyringe';
import { Logger } from 'winston';
export class ServerDBAnalysis implements DBAnalysis {
	constructor(db: unknown) {
		this.db = db;
	}
	private readonly db: unknown;
	private readonly logger = container.resolve<Logger>('logger');
	async create(entry: DBAnalysis.Input): Promise<void> {
		return;
	}
	async read(_id: string): Promise<DBAnalysis.Analysis> {
		return null;
	}
	async update(_id: string): Promise<void> {
		return;
	}
	async delete(_id): Promise<void> {
		return;
	}
}
