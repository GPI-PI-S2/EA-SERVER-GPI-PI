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

		const check = await this.db.query('SELECT _id FROM Entry WHERE _id = ?;', [entry._entryId]);
		if (check.length === 0) throw ('_entryId NOT found on Entry table');

		const checkPrev = await this.db.query('SELECT _id FROM Analysis WHERE _entryId = ?', [entry._entryId]);
		if (checkPrev.length === 0) {
			const now = new Date();
			entry.completionDate = entry.completionDate ? entry.completionDate : `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

			this.logger.info('Adding Analysis for Entry ', entry._entryId);
			const res = await this.db.query('INSERT INTO Analysis SET ?', entry);
			return res.insertId;
		}
		else {
			if (force) {
				const res = await this.db.query('UPDATE Entry SET ?;', entry);
				return res.insertId;
			}
			return checkPrev[0]._id;

		}
	}
	async read(_id: number): Promise<DBAnalysis.Analysis> {
		return null;
	}
	async update(_id: number, entry: DBAnalysis.Input): Promise<void> {
		return;
	}
	async delete(_id): Promise<void> {
		this.logger.info('Deleting _id: ', _id);
		await this.db.query('UPDATE Analysis SET _deleted = 1 WHERE _id = ?;', [_id]);

	}
}
