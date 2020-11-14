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
	private readonly defaultEntry: Required<DBAnalysis.Input> = {
		"Asertividad": 0,
		"Autoconciencia Emocional": 0,
		"Autoestima": 0,
		"Colaboración y Cooperación": 0,
		"Comprensión Organizativa": 0,
		"Conciencia Crítica": 0,
		"Desarrollo de las relaciones": 0,
		"Empatía": 0,
		"Influencia": 0,
		"Liderazgo": 0,
		"Manejo de conflictos": 0,
		"Motivación de logro": 0,
		"Percepción y comprensión Emocional": 0,
		"Optimismo": 0,
		"Relación Social": 0,
		"Tolerancia a la frustración": 0,
		"Violencia": 0,
		"_entryId": -1,
		"completionDate": '',
		"modelVersion": ''
	}
	async create(e: DBAnalysis.Input): Promise<void> {
		let entry: Required<DBAnalysis.Input> = {...this.defaultEntry, ...e};
		const now = new Date();
		entry.completionDate = entry.completionDate ? entry.completionDate : `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
		const sentiments = Object.entries(entry).filter(([key, _]) => key !== '_entryId');
		const sentimentsSQL = 'INSERT INTO Analysis SET '
			+ sentiments.map(([key, _]) => `\`${key}\` = ?`).join(', ')
			+ ', _entryId = (SELECT _id FROM Entry WHERE _id = ? AND _deleted = 0)';

		const sentimentsValues = sentiments.map(([_, value]) => value);
		this.logger.info('Adding Analysis for Entry ', entry._entryId);
		await this.db.query(sentimentsSQL, sentimentsValues.concat(entry._entryId));
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
