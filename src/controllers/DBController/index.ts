import {Analyzer, DBAnalysis, DBController, DBEntry} from 'ea-core-gpi-pi';
import {container} from 'tsyringe';
import {Logger} from 'winston';
import {ServerDBAnalysis} from './Analysis';
import {ServerDBEntry} from './Entry';
import mysql from 'promise-mysql';
import {DBCONTROLLER_APP, DBCONTROLLER_ENDPOINT, DBCONTROLLER_KEY, DBCONTROLLER_VERSION, DBCONTROLLER_HOST, DBCONTROLLER_USER, DBCONTROLLER_PASSWORD, DBCONTROLLER_DBNAME} from '../../config'

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
	async connect() {
		let connectionPool = mysql.createPool({
			connectionLimit: 20,
			host: DBCONTROLLER_HOST,
			user: DBCONTROLLER_USER,
			password: DBCONTROLLER_PASSWORD,
			database: DBCONTROLLER_DBNAME
		});
		this.db = await connectionPool;
		this.$entry = new ServerDBEntry(this.db);
		this.$analysis = new ServerDBAnalysis(this.db);

	}
	private db: mysql.Pool;
	private readonly logger = container.resolve<Logger>('logger');
	$entry: DBEntry;
	$analysis: DBAnalysis;
	async calc(metakey: string): Promise<DBController.calcResult> {
		const sentiments: Analyzer.sentiments = {
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
		return {
			sentiments,
			total: NaN,
		};
	}
	async stats(): Promise<{[key: string]: number}> {
		return {};
	}
	async insert(analysis: Analyzer.Analysis): Promise<void> {
		return;
	}
	async bulkDB(dbPath: string): Promise<DBController.bulkDBResult> {
		return {accepted: NaN, rejected: NaN};
	}
}
