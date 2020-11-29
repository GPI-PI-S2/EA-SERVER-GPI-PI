import MD5 from 'crypto-js/md5';
import { DBController, DBEntry } from 'ea-core-gpi-pi';
import mysql from 'promise-mysql';
import { container } from 'tsyringe';
import { Logger } from 'winston';

export class ServerDBEntry implements DBEntry {
	constructor(private readonly db: mysql.Pool) {}
	private readonly logger = container.resolve<Logger>('logger');
	async create(
		entry: DBEntry.Input,
		force: boolean,
	): Promise<{ _id: DBController.id; replaced?: boolean }> {
		if (!this.db) throw new Error('no db instance');
		entry.content = entry.content ? entry.content : '';
		entry.hash = MD5(entry.content).toString();
		const checkPrev: {
			_id: DBController.id;
		}[] = await this.db.query('SELECT _id FROM Entry WHERE hash = ?;', [entry.hash]);
		if (checkPrev.length === 0) {
			const res: { insertId: number } = await this.db.query('INSERT INTO Entry SET ?', entry);
			return { _id: res.insertId };
		} else {
			const existingId = checkPrev[0]._id;
			// Indica si realmente fue reemplazado la entry
			let replaced = false;
			if (force) {
				await this.db.query('UPDATE Entry SET ? WHERE _id = ?;', [entry, existingId]);
				replaced = true;
			}
			return { _id: existingId, replaced };
		}
	}
	async read(_id: DBController.id): Promise<DBEntry.Entry> {
		if (!this.db) throw new Error('no db instance');
		const res: DBEntry.Entry[] = await this.db.query(
			'SELECT * FROM Entry WHERE _id = ? AND _deleted = 0;',
			[_id],
		);
		if (res.length === 0) {
			this.logger.error('Empty result for _id ', _id);
			throw `Empty result for reading _id ${_id}`;
		}
		return { ...res[0] };
	}
	async update(_id: DBController.id, entry: DBEntry.Input): Promise<void> {
		if (!this.db) throw new Error('no db instance');
		this.logger.info('Updating Entry, _id ', _id);
		await this.db.query('UPDATE Entry SET ? WHERE _id = ?;', [entry, _id]);
	}
	async delete(_id: DBController.id): Promise<void> {
		if (!this.db) throw new Error('no db instance');
		this.logger.info('Deleting Entry, _id: ', _id);
		await this.db.query('UPDATE Entry SET _deleted = 1 WHERE _id = ?;', [_id]);
	}
	async list(
		paginator: DBController.Paginator,
		filter: DBEntry.Filter = {},
	): Promise<DBController.PaggedList<DBEntry.Entry>> {
		if (!this.db) throw new Error('no db instance');
		// ojo, los filtros pueden llegar indefinidos
		const { created, extractor, metaKey } = filter;
		const filterArray = [
			{
				key: 'DATE(created) = DATE(?)',
				value: created,
			},
			{
				key: 'extractor = ?',
				value: extractor,
			},
			{
				key: 'metaKey = ?',
				value: metaKey,
			},
		].filter(({ value }) => value); // seleccionar filtros thruthy

		const SQLFilterKeys =
			(filterArray.length === 0 ? '' : ' AND ') +
			filterArray.map(({ key }) => key).join(' AND ');
		const SQLFilterValues: (boolean | string | number)[] = filterArray.map(
			({ value }) => value,
		);

		const pageOffset = paginator.page * paginator.size;
		const pageSQL = [paginator.size, pageOffset];

		const res: DBEntry.Input[] = await this.db.query(
			'SELECT _id, hash, created, extractor, metaKey, content FROM Entry WHERE _deleted = 0' +
				SQLFilterKeys +
				' LIMIT ? OFFSET ?;',
			SQLFilterValues.concat(pageSQL),
		);
		const total: { total: number }[] = await this.db.query('SELECT COUNT(_id) from Entry');

		return {
			list: res.map((dataRow: DBEntry.Entry) => ({ ...dataRow })),
			page: paginator.page,
			size: res.length,
			total: total[0].total,
		};
	}
}
