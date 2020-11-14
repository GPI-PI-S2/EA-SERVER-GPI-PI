import {DBController, DBAnalysis} from 'ea-core-gpi-pi';
import {container} from 'tsyringe';
import {Logger} from 'winston';
import mysql from 'promise-mysql';
import MD5 from "crypto-js/md5";

export class ServerDBAnalysis implements DBAnalysis {
	constructor(db: mysql.Pool) {
		this.db = db;
	}
	private readonly db: mysql.Pool;
	private readonly logger = container.resolve<Logger>('logger');
	async create(entry: DBAnalysis.Input, force: boolean): Promise<number> {
		if (entry._entryId === undefined || entry._entryId < 0) throw ('Invalid _entryId');

		const check: {_id: number}[] = await this.db.query('SELECT _id FROM Entry WHERE _id = ?;', [entry._entryId]);
		if (check.length === 0) throw ('_entryId NOT found on Entry table');

		const checkPrev: {_id: number}[] = await this.db.query('SELECT _id FROM Analysis WHERE _entryId = ?', [entry._entryId]);
		if (checkPrev.length === 0) {
			this.logger.info('Adding Analysis for Entry ', entry._entryId);
			const res: {insertId: number} = await this.db.query('INSERT INTO Analysis SET ?', entry);
			return res.insertId;
		}
		else {
			const existingId = checkPrev[0]._id;
			if (force) {
				await this.db.query('UPDATE Analysis SET ? WHERE id = ?', [entry, entry._entryId]);
				return existingId;
			}
			return existingId;

		}
	}
	async read(_id: number): Promise<DBAnalysis.Analysis> {
		this.logger.info('Obtaining Analysis, _id: ', _id);
		const res: DBAnalysis.Analysis[] = await this.db.query('SELECT * FROM Analysis WHERE _id = ? AND _deleted = 0;', [_id]);
		if (res.length === 0) {
			this.logger.error('Empty result for _id ', _id);
			throw (`Empty result for reading _id ${_id}`);
		}
		return ({...res[0]});

	}
	async update(_id: number, entry: DBAnalysis.Input): Promise<void> {
		this.logger.info('Updating Analysis, _id ', _id);
		await this.db.query('UPDATE Analysis SET ? WHERE _id = ?;', [entry, _id]);
	}
	async delete(_id): Promise<void> {
		this.logger.info('Deleting Analysis, _id: ', _id);
		await this.db.query('UPDATE Analysis SET _deleted = 1 WHERE _id = ?;', [_id]);

	}
}
