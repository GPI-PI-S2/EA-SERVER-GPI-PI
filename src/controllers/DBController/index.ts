import { Anal, DBAnalysis, DBController, DBEntry } from 'ea-core-gpi-pi';
import { Sentiments } from 'ea-core-gpi-pi/dist/Analyzer/Sentiments';
import mysql from 'promise-mysql';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { container } from 'tsyringe';
import { Logger } from 'winston';
import { DB_ADDRESS, DB_LIMIT, DB_NAME, DB_PASS, DB_PORT, DB_USER } from '../../config';
import { ServerDBAnalysis } from './Analysis';
import { ServerDBEntry } from './Entry';

export class ServerDBController implements DBController {
	constructor() {
		/*
				Acá inicializar la db.
				En caso de requerir métodos asíncronos, asignar la referencia acá
				 y crear un método asíncrono que la inicialice.
				 No usar promesas dentro del constructor
				 Cambiar el tipo unknown de la variable DB por el correspondiente
				*/
	}
	private readonly sentiments: Sentiments.list = {
		Asertividad: NaN,
		'Autoconciencia Emocional': NaN,
		Autoestima: NaN,
		'Colaboración y Cooperación': NaN,
		'Comprensión Organizativa': NaN,
		'Conciencia Crítica': NaN,
		'Desarrollo de las relaciones': NaN,
		Empatía: NaN,
		Influencia: NaN,
		Liderazgo: NaN,
		'Manejo de conflictos': NaN,
		'Motivación de logro': NaN,
		Optimismo: NaN,
		'Percepción y comprensión Emocional': NaN,
		'Relación Social': NaN,
		'Tolerancia a la frustración': NaN,
		Violencia: NaN,
	};
	private db: mysql.Pool;
	private readonly logger = container.resolve<Logger>('logger');
	private readonly entry: DBEntry.Input = {
		hash: null,
		created: null,
		extractor: null,
		metaKey: null,
		content: null,
	};
	$entry: DBEntry;
	$analysis: DBAnalysis;
	async connect(): Promise<void> {
		const connectionPool = mysql.createPool({
			connectionLimit: DB_LIMIT,
			host: DB_ADDRESS,
			port: DB_PORT,
			user: DB_USER,
			password: DB_PASS,
			database: DB_NAME,
			charset: 'utf8mb4',
		});
		this.db = await connectionPool;
		this.$entry = new ServerDBEntry(this.db);
		this.$analysis = new ServerDBAnalysis(this.db);
	}
	async disconnect(): Promise<void> {
		return;
	}
	async calc(metakey: string): Promise<DBController.calcResult> {
		if (!this.db) throw new Error('no db instance');
		const sentimentsAVGSQL =
			'SELECT ' +
			Object.keys(this.sentiments)
				.map((sentiment) => `AVG(a.\`${sentiment}\`) as \`${sentiment}\``)
				.join(', ') +
			', COUNT (e._id) as `total` FROM Entry e, Analysis a WHERE a.`_entryId` = e.`_id` AND e.metaKey = ?;';

		const res: (Sentiments.list & {
			total: number;
		})[] = await this.db.query(sentimentsAVGSQL, [metakey]);
		if (res.length === 0) throw 'Empty result set for calc';
		const sentimentsAVG = { ...res[0] };
		delete sentimentsAVG.total;
		return {
			sentiments: sentimentsAVG,
			total: res[0].total, // total registros
		};
	}
	async stats(): Promise<{ [key: string]: number }> {
		if (!this.db) throw new Error('no db instance');
		// cuantos reg hay por cada extractor
		const res: { total: number; extractor: DBEntry.Entry['extractor'] }[] = await this.db.query(
			'SELECT COUNT(_id) as `total`, extractor  FROM Entry GROUP BY extractor',
		);
		return res.reduce(
			(stats, { total, extractor }) => ({
				...stats,
				[extractor]: total,
			}),
			{},
		);
	}
	async insert(analysis: Anal.Analysis): Promise<void> {
		// TODO fix performance
		if (!this.db) throw new Error('no db instance');
		// prioritaria
		const { result, metaKey, extractor, modelVersion } = analysis;

		for (const { input, sentiments } of result) {
			try {
				const { _id, replaced } = await this.$entry.create(
					{ metaKey, extractor, content: input.content },
					false,
				);
				if (!replaced) {
					await this.$analysis.create(
						{ ...sentiments, ...{ _entryId: _id, modelVersion } },
						false,
					);
				}
			} catch (error) {
				this.logger.debug(`Insert error`);
				this.logger.debug(`Insert error, content: ${input.content}`);
				this.logger.debug(`Insert error, size: ${input.content.length}`);
				throw new Error(error);
			}
		}

		return;
	}
	async entryExists(hash: DBEntry.Entry['hash']): Promise<boolean> {
		if (!this.db) throw new Error('no db instance');
		const res: DBController.id[] = await this.db.query(
			'SELECT _id FROM Entry WHERE hash = ?;',
			[hash],
		);
		return res.length !== 0;
	}
	async bulkDB(dbPath: string): Promise<DBController.bulkDBResult> {
		const SQLiteDb = await open({
			filename: dbPath,
			driver: sqlite3.Database,
		});
		const query =
			'SELECT ' +
			[
				...Object.keys(this.sentiments).map((sentiment) => `a.\`${sentiment}\``),
				...Object.keys(this.entry).map((entryParam) => `e.\`${entryParam}\``),
			].join(', ') +
			' FROM Analysis a, Entry e WHERE a.`_entryId` = e.`_id` AND e.`_deleted` = 0;';

		const rows: (DBEntry.Input & DBAnalysis.Input)[] = await SQLiteDb.all(query);
		let accepted = 0;
		let rejected = 0;
		for (const row of rows) {
			// TODO optimizar
			// idea filtrar resultados cuyas ids existen, resultados existentes -> dbEntry
			// obtener max(dbentry -> _id)
			// analysis map {_entryId} -> {_entryId = max++} -> dbAnalysis
			// needs stringbuffer y aumentar tamaño de query de la base de datos.
			const { _id, replaced } = await this.$entry.create(row, false);
			if (!replaced) {
				accepted += 1;
				await this.$analysis.create({ ...row, ...{ _entryId: _id } }, false);
			} else {
				rejected += 1;
			}
		}

		await SQLiteDb.close();

		return { accepted, rejected };
	}
}
