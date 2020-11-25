import { DBAnalysis, DBController } from 'ea-core-gpi-pi';
import mysql from 'promise-mysql';
import { container } from 'tsyringe';
import { Logger } from 'winston';

export class ServerDBAnalysis implements DBAnalysis {
	constructor(private readonly db: mysql.Pool) {}
	private readonly logger = container.resolve<Logger>('logger');
	async create(
		entry: DBAnalysis.Input,
		force: boolean,
	): Promise<{ _id: DBController.id; replaced?: boolean }> {
		if (typeof entry._entryId === 'string' && !entry._entryId)
			throw new Error('Invalid _entryId');
		if (typeof entry._entryId === 'number' && entry._entryId < 0)
			throw new Error('Invalid _entryId');

		const check: {
			_id: DBController.id;
		}[] = await this.db.query('SELECT _id FROM Entry WHERE _id = ?;', [entry._entryId]);
		if (check.length === 0) throw '_entryId NOT found on Entry table';

		const checkPrev: {
			_id: DBController.id;
		}[] = await this.db.query('SELECT _id FROM Analysis WHERE _entryId = ?', [entry._entryId]);
		if (checkPrev.length === 0) {
			const res: { insertId: DBController.id } = await this.db.query(
				'INSERT INTO Analysis SET ?',
				entry,
			);
			return { _id: res.insertId };
		} else {
			const existingId = checkPrev[0]._id;
			// Indica si realmente fue reemplazado la entry
			let replaced = false;
			if (force) {
				await this.db.query('UPDATE Analysis SET ? WHERE _id = ?', [entry, entry._entryId]);
				replaced = true;
			}
			return { _id: existingId, replaced };
		}
	}
	async read(_id: DBController.id): Promise<DBAnalysis.Analysis> {
		const res: DBAnalysis.Analysis[] = await this.db.query(
			'SELECT * FROM Analysis WHERE _id = ? AND _deleted = 0;',
			[_id],
		);
		if (res.length === 0) {
			this.logger.error('Empty result for _id ', _id);
			throw `Empty result for reading _id ${_id}`;
		}
		return { ...res[0] };
	}
	async update(_id: DBController.id, entry: DBAnalysis.Input): Promise<void> {
		this.logger.info('Updating Analysis, _id ', _id);
		await this.db.query('UPDATE Analysis SET ? WHERE _id = ?;', [entry, _id]);
	}
	async delete(_id: DBController.id): Promise<void> {
		this.logger.info('Deleting Analysis, _id: ', _id);
		await this.db.query('UPDATE Analysis SET _deleted = 1 WHERE _id = ?;', [_id]);
	}
}
