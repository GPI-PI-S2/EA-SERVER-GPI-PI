import { Anal, DBAnalysis, DBController, DBEntry } from 'ea-core-gpi-pi';
import { Sentiments } from 'ea-core-gpi-pi/dist/Analyzer/Sentiments';
import mysql from 'promise-mysql';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { container } from 'tsyringe';
import { Logger } from 'winston';
import { DB_ADDRESS, DB_LIMIT, DB_NAME, DB_PASS, DB_PORT, DB_USER } from '../../config';
import { CustomError } from '../CustomError';
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
		asertividad: 0,
		'autoconciencia emocional': 0,
		autoestima: 0,
		'desarrollar y estimular a los demás': 0,
		empatía: 0,
		'autocontrol emocional': 0,
		influencia: 0,
		liderazgo: 0,
		optimismo: 0,
		'relación social': 0,
		'colaboración y cooperación': 0,
		'comprensión organizativa': 0,
		'conciencia crítica': 0,
		'desarrollo de las relaciones': 0,
		'tolerancia a la frustración': 0,
		'comunicacion asertiva': 0,
		'manejo de conflictos': 0,
		'motivación de logro': 0,
		'percepción y comprensión emocional': 0,
		violencia: 0,
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
		if (!this.db) throw new CustomError('INTERNAL_ERROR', 'No DB instance');
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
		if (!this.db) throw new CustomError('INTERNAL_ERROR', 'No DB instance');
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
		if (!this.db) throw new CustomError('INTERNAL_ERROR', 'No DB instance');
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
						{ ...sentiments, _entryId: _id, modelVersion },
						false,
					);
				}
			} catch (error) {
				if (error !== 'Entry Exists' && error !== 'Analysis Exists') {
					this.logger.debug(`Insert error`);
					this.logger.debug(`Insert error, content: ${input.content}`);
					this.logger.debug(`Insert error, size: ${input.content.length}`);
					throw new Error(error);
				}
			}
		}

		return;
	}
	async entryExists(hash: DBEntry.Entry['hash']): Promise<boolean> {
		if (!this.db) throw new CustomError('INTERNAL_ERROR', 'No DB instance');
		const res: DBController.id[] = await this.db.query(
			'SELECT _id FROM Entry WHERE hash = ?;',
			[hash],
		);
		return res.length !== 0;
	}

	async bulkDB(dbPath: string): Promise<DBController.bulkDBResult> {
		const analysisMySQL: Required<Omit<DBAnalysis.Input, '_entryId'>> &
			Pick<DBEntry.Entry, 'hash'> = {
			...this.sentiments,
			completionDate: null,
			modelVersion: null,
			hash: null, // se usa el hash del Entry en un trigger de la base de datos para sacar el _entryId asociado
		};

		const analysisSQlite: Omit<typeof analysisMySQL, 'hash'> = {
			...this.sentiments,
			completionDate: null,
			modelVersion: null,
		};

		const SQLiteDb = await open({
			filename: dbPath,
			driver: sqlite3.Database,
		});

		const querySQLite =
			'SELECT ' +
			[
				...Object.keys(analysisSQlite).map((analysisParam) => `a.\`${analysisParam}\``),
				...Object.keys(this.entry).map((entryParam) => `e.\`${entryParam}\``),
			].join(', ') +
			' FROM Analysis a, Entry e WHERE a.`_entryId` = e.`_id` AND e.`_deleted` = 0 LIMIT ?,?;';

		type SQLiteRow = DBEntry.Input & typeof analysisSQlite;

		const getEntryFromRow = (row: SQLiteRow) => Object.keys(this.entry).map((key) => row[key]);

		const getAnalysisFromRow = (row: SQLiteRow) =>
			Object.keys(analysisMySQL).map((key) => row[key]);

		const limit = 1000; // particion de 1000 registros

		const entryProps = Object.keys(this.entry)
			.map((key) => `\`${key}\``)
			.join(', ');

		const analysisProps = Object.keys(analysisMySQL)
			.map((key) => `\`${key}\``)
			.join(', ');

		const entryQuery = `INSERT IGNORE INTO Entry (${entryProps}) VALUES ?`;
		const analysisQuery = `INSERT IGNORE INTO Analysis (${analysisProps}) VALUES ?`;

		let lastPartition = false;
		let accepted = 0;
		let rejected = 0;
		let currentInserted = 0;
		// en cada iteracion obtener una particion de datos y pasarlos a la base de datos
		while (!lastPartition) {
			const rows = await SQLiteDb.all<SQLiteRow[]>(querySQLite, currentInserted, limit);
			if (rows.length !== 0) {
				const entryRes: { affectedRows: number } = await this.db.query(entryQuery, [
					rows.map(getEntryFromRow),
				]);
				await this.db.query(analysisQuery, [rows.map(getAnalysisFromRow)]);
				currentInserted = currentInserted + limit;

				accepted = accepted + entryRes.affectedRows;
				rejected = rejected + rows.length - entryRes.affectedRows;
			} else {
				lastPartition = true;
			}
		}

		SQLiteDb.close();

		return { accepted, rejected };
	}
}
