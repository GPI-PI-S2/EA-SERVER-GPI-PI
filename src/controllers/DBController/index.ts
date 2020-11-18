import { Analyzer, DBAnalysis, DBController, DBEntry } from 'ea-core-gpi-pi';
import mysql from 'promise-mysql';
import { container } from 'tsyringe';
import { Logger } from 'winston';
import {
	DBCONTROLLER_DBNAME,
	DBCONTROLLER_HOST,
	DBCONTROLLER_PASSWORD,
	DBCONTROLLER_USER,
} from '../../config';
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
	async connect(): Promise<void> {
		const connectionPool = mysql.createPool({
			connectionLimit: 20,
			host: DBCONTROLLER_HOST,
			user: DBCONTROLLER_USER,
			password: DBCONTROLLER_PASSWORD,
			database: DBCONTROLLER_DBNAME,
		});
		this.db = await connectionPool;
		this.$entry = new ServerDBEntry(this.db);
		this.$analysis = new ServerDBAnalysis(this.db);
	}
	private db: mysql.Pool;
	private readonly logger = container.resolve<Logger>('logger');
	$entry: DBEntry;
	$analysis: DBAnalysis;
	private readonly sentiments: Analyzer.sentiments = {
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
	async calc(metakey: string): Promise<DBController.calcResult> {
		const sentimentsAVGSQL =
			'SELECT ' +
			Object.keys(this.sentiments)
				.map((sentiment) => `AVG(a.\`${sentiment}\`) as \`${sentiment}\``)
				.join(', ') +
			', COUNT (e._id) as `total` FROM Entry e, Analysis a WHERE a.`_entryId` = e.`_id` AND e.metaKey = ?;';

		const res: (Analyzer.sentiments & {
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
		// cuantos reg hay por cada extractor
		const res: {
			total: number;
			metaKey: DBEntry.Entry['metaKey'];
		}[] = await this.db.query(
			'SELECT COUNT(_id) as `total`, metaKey  FROM Entry GROUP BY metaKey',
		);
		return res.reduce(
			(stats, { total, metaKey }) => ({
				...stats,
				[metaKey]: total,
			}),
			{},
		);
	}
	async insert(analysis: Analyzer.Analysis): Promise<void> {
		// prioritaria
		const { result, metaKey, extractor, modelVersion } = analysis;

		for (const { input, sentiments } of result) {
			const _entryId = (
				await this.$entry.create({ metaKey, extractor, content: input.content }, false)
			)._id;

			await this.$analysis.create({ ...sentiments, ...{ _entryId, modelVersion } }, false);
		}

		return;
	}
	async bulkDB(dbPath: string): Promise<DBController.bulkDBResult> {
		return { accepted: NaN, rejected: NaN };
		// abrir binario sqllite e ingresarlo a db
	}
}
