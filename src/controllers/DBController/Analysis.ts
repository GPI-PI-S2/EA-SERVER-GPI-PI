import { DBAnalysis, DBController } from 'ea-core-gpi-pi';
import mysql from 'promise-mysql';
import { container } from 'tsyringe';
import { Logger } from 'winston';
import { CustomError } from '../CustomError';

export class ServerDBAnalysis implements DBAnalysis {
	constructor(private readonly db: mysql.Pool) {}
	private readonly logger = container.resolve<Logger>('logger');
	async create(
		entry: DBAnalysis.Input,
		force: boolean,
	): Promise<{ _id: DBController.id; replaced?: boolean }> {
		if (!this.db) throw new CustomError('INTERNAL_ERROR', 'No DB instance');
		if (!entry._entryId) throw new Error('Invalid _entryId');

		if (!force) {
			try {
				const res: { insertId: number } = await this.db.query(
					'INSERT INTO Analysis SET ?',
					entry,
				);
				return { _id: res.insertId };
			} catch (error) {
				// duplicate _entryId
				if (error.errno === 1062) {
					throw 'Analysis Exists';
				}
				throw error;
			}
		} else {
			const res: {
				insertId: number;
				changedRows: number;
			} = await this.db.query('INSERT INTO Analysis SET ? ON DUPLICATE KEY UPDATE ?', [
				entry,
				entry,
			]);
			return { _id: res.insertId, replaced: res.changedRows !== 0 };
		}
	}
	async read(_id: DBController.id, byEntry = false): Promise<DBAnalysis.Analysis> {
		if (!this.db) throw new CustomError('INTERNAL_ERROR', 'No DB instance');
		const query = byEntry
			? 'SELECT * FROM Analysis WHERE _entryId = ? AND _deleted = 0;'
			: 'SELECT * FROM Analysis WHERE _id = ? AND _deleted = 0;';
		const res: DBAnalysis.Analysis[] = await this.db.query(query, [_id]);
		if (res.length === 0) {
			this.logger.error('Empty result for _id ', _id);
			throw new CustomError('NOT_FOUND', `Empty result for reading _id ${_id}`);
		}
		return { ...res[0] };
	}
	async update(_id: DBController.id, entry: DBAnalysis.Input): Promise<void> {
		if (!this.db) throw new CustomError('INTERNAL_ERROR', 'No DB instance');
		this.logger.info('Updating Analysis, _id ', _id);
		await this.db.query('UPDATE Analysis SET ? WHERE _id = ?;', [entry, _id]);
	}
	async delete(_id: DBController.id): Promise<void> {
		if (!this.db) throw new CustomError('INTERNAL_ERROR', 'No DB instance');
		this.logger.info('Deleting Analysis, _id: ', _id);
		await this.db.query('UPDATE Analysis SET _deleted = 1 WHERE _id = ?;', [_id]);
	}
}
