import {DBController, DBAnalysis} from 'ea-core-gpi-pi';
import {container} from 'tsyringe';
import {Logger} from 'winston';
import mysql from 'promise-mysql';

export class ServerDBAnalysis implements DBAnalysis {
	constructor(db: mysql.Pool) {
		this.db = db;
	}
	private readonly db: mysql.Pool;
	private readonly logger = container.resolve<Logger>('logger');
	async create(entry: DBAnalysis.Input): Promise<void> {
		return;
	}
	async read(_id: number): Promise<DBAnalysis.Analysis> {
		return null;
	}
	async update(_id: number, entry: DBAnalysis.Input): Promise<void> {
		return;
	}
	async delete(_id): Promise<void> {
		return;
	}
}
