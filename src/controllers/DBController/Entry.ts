import {DBController, DBEntry} from 'ea-core-gpi-pi';
import {container} from 'tsyringe';
import {Logger} from 'winston';
import mysql from 'promise-mysql';
import MD5 from "crypto-js/md5";

export class ServerDBEntry implements DBEntry {
	constructor(db: mysql.Pool) {
		this.db = db;
	}
	private readonly db;
	private readonly logger = container.resolve<Logger>('logger');
	async create(entry: DBEntry.Input, force: boolean): Promise<void> {
		let {metaKey, content, extractor} = entry;
		metaKey = metaKey ? metaKey : '';
		content = content ? content : '';
		extractor = extractor ? extractor : '';
		let hash = MD5(content).toString();
		this.logger.info('Adding ', content, ', from ', extractor);

		const res = await this.db.query('SELECT id FROM Entry WHERE hash = ?;', [hash]);
		let storedId: number;
		if (!res.length) {storedId = -1;}
		else {storedId = res[0].id;}

		if (storedId === -1) { // no previous entry
			await this.db.query('INSERT INTO Entry (hash, source, metaKey, content) VALUES (?, ?, ?, ?);',
				[hash, extractor, metaKey, content]);
		}
		else {
			if (force) {
				await this.db.query('UPDATE Entry SET hash = ?, source = ?, metaKey = ?, content = ? WHERE id = ?;',
					[hash, extractor, metaKey, content, storedId]);
			}
		}
		return;
	}
	async read(_id: string): Promise<DBEntry.Entry> {
		this.logger.info('Obtaining id: ', _id);
		const res = await this.db.query('SELECT id, hash, created, source, metaKey, content, _deleted FROM Entry WHERE id = ? AND _deleted = 0;', [_id]);

		if (res.length === 0) {
			this.logger.error('Empty result for id ', _id);
			throw (`Empty result for id ${_id}`);
		}
		const entry = res[0];
		return ({...entry});

	}
	async update(_id: string, entry: DBEntry.Input): Promise<void> {
		let {metaKey, content, extractor} = entry;
		metaKey = metaKey ? metaKey : '';
		content = content ? content : '';
		extractor = extractor ? extractor : '';
		let hash = MD5(content).toString();
		this.logger.info('Updating ', content, ', from ', extractor, ', id ', _id);
		await this.db.query('UPDATE Entry SET hash = ?, source = ?, metaKey = ?, content = ? WHERE id = ?;',
			[hash, extractor, metaKey, content, _id]);

	}
	async delete(_id): Promise<void> {
		this.logger.info('Obtaining id: ', _id);
		const res = await this.db.query('UPDATE Entry SET _deleted = 1 WHERE id = ?;', [_id]);
		if (res.length === 0) {
			this.logger.error('Not found id ', _id);
		}
	}
	async list(
		paginator: DBController.Paginator,
		filter: DBEntry.Filter = {},
	): Promise<DBController.PaggedList<DBEntry.Entry>> {
		// ojo, los filtros pueden llegar indefinidos
		const {created, extractor, metaKey} = filter;
		return {
			list: [],
			page: NaN,
			size: NaN,
			total: NaN,
		};
	}
}
