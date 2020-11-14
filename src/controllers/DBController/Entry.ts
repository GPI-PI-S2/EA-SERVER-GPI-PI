import {DBController, DBEntry} from 'ea-core-gpi-pi';
import {container} from 'tsyringe';
import {Logger} from 'winston';
import mysql from 'promise-mysql';
import MD5 from "crypto-js/md5";

export class ServerDBEntry implements DBEntry {
	constructor(db: mysql.Pool) {
		this.db = db;
	}
	private readonly db: mysql.Pool;
	private readonly logger = container.resolve<Logger>('logger');
	async create(entry: DBEntry.Input, force: boolean): Promise<number> {
		let {metaKey, content, extractor, created} = entry;
		metaKey = metaKey ? metaKey : '';
		content = content ? content : '';
		extractor = extractor ? extractor : '';
		const now = new Date();
		created = created? created: `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
		let hash = MD5(content).toString();
		this.logger.info('Adding ', content, ', from ', extractor);
		const res = await this.db.query('SELECT _id FROM Entry WHERE hash = ?;', [hash]);
		let storedId: number;
		if (!res.length) {storedId = -1;}
		else {storedId = res[0]._id;}

		if (storedId === -1) { // no previous entry
			const res = await this.db.query('INSERT INTO Entry (hash, extractor, metaKey, content, created) VALUES (?, ?, ?, ?, ?);',
				[hash, extractor, metaKey, content, created]);
			return res.insertId;
		}
		else {
			if (force) {
				const res = await this.db.query('UPDATE Entry SET hash = ?, extractor = ?, metaKey = ?, content = ?, _deleted = 0 WHERE _id = ?;',
					[hash, extractor, metaKey, content, storedId]);
				return res.insertId;
			}
			return storedId;
		}
	}
	async read(_id: number): Promise<DBEntry.Entry> {
		this.logger.info('Obtaining _id: ', _id);
		const res = await this.db.query('SELECT _id, hash, created, extractor, metaKey, content, _deleted FROM Entry WHERE _id = ? AND _deleted = 0;', [_id]);
		if (res.length === 0) {
			this.logger.error('Empty result for _id ', _id);
			throw (`Empty result for reading _id ${_id}`);
		}
		const entry = res[0];
		return ({...entry});

	}
	async update(_id: number, entry: DBEntry.Input): Promise<void> {
		let {metaKey, content, extractor} = entry;
		const res = await this.db.query('SELECT _id, hash, created, extractor, metaKey, content, _deleted FROM Entry WHERE _id = ?;', [_id]);
		if (res.length === 0) {
			this.logger.error('Empty result for _id ', _id);
			throw (`Empty result for updating _id ${_id}`);
		}
		const entryDB = res[0];

		metaKey = metaKey ? metaKey : entryDB.metaKey;
		content = content ? content : entryDB.content;
		extractor = extractor ? extractor : entryDB.extractor;
		let hash = MD5(content).toString();
		this.logger.info('Updating ', content, ', from ', extractor, ', _id ', _id);
		await this.db.query('UPDATE Entry SET hash = ?, extractor = ?, metaKey = ?, content = ? _deleted = 0 WHERE _id = ?;',
			[hash, extractor, metaKey, content, _id]);

	}
	async delete(_id: number): Promise<void> {
		this.logger.info('Deleting _id: ', _id);
		await this.db.query('UPDATE Entry SET _deleted = 1 WHERE _id = ?;', [_id]);
	}
	async list(
		paginator: DBController.Paginator,
		filter: DBEntry.Filter = {},
	): Promise<DBController.PaggedList<DBEntry.Entry>> {
		// ojo, los filtros pueden llegar indefinidos
		const {created, extractor, metaKey} = filter;
		const filterArray = [{
			key: 'DATE(created) = DATE(?)', value: created
		}, {
			key: 'extractor = ?', value: extractor
		}, {
			key: 'metaKey = ?', value: metaKey
		}]
			.filter(({value}) => value); // seleccionar filtros thruthy

		const SQLFilterKeys = ((filterArray.length === 0) ? '' : ' AND ') + filterArray.map(({key}) => key).join(' AND ');
		const SQLFilterValues: (number | string)[] = filterArray.map(({value}) => value);

		const pageOffset = paginator.page * paginator.size;
		const pageSQL = [paginator.size, pageOffset];

		console.log(SQLFilterValues.concat(pageSQL));
		const res = await this.db.query('SELECT _id, hash, created, extractor, metaKey, content FROM Entry WHERE _deleted = 0'
			+ SQLFilterKeys
			+ ' LIMIT ? OFFSET ?;'
			, SQLFilterValues.concat(pageSQL));

		return {
			list: res.map((dataRow: DBEntry.Entry) => ({...dataRow})),
			page: paginator.page,
			size: res.length,
			total: pageOffset + res.length,
		};
	}
}
