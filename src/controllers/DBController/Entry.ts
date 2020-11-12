import { DBController, DBEntry } from 'ea-core-gpi-pi';
import { container } from 'tsyringe';
import { Logger } from 'winston';
export class ServerDBEntry implements DBEntry {
	constructor(db: unknown) {
		this.db = db;
	}
	private readonly db: unknown;
	private readonly logger = container.resolve<Logger>('logger');
	async create(entry: DBEntry.Input): Promise<void> {
		return;
	}
	async read(_id: string): Promise<DBEntry.Entry> {
		return null;
	}
	async update(_id: string): Promise<void> {
		return;
	}
	async delete(_id): Promise<void> {
		return;
	}
	async list(
		paginator: DBController.Paginator,
		filter: DBEntry.Filter = {},
	): Promise<DBController.PaggedList<DBEntry.Entry>> {
		// ojo, los filtros pueden llegar indefinidos
		const { created, extractor, metaKey } = filter;
		return {
			list: [],
			page: NaN,
			size: NaN,
			total: NaN,
		};
	}
}
