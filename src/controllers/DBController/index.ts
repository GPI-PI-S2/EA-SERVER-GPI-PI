import { Analyzer, DBAnalysis, DBController, DBEntry } from 'ea-core-gpi-pi';
import { container } from 'tsyringe';
import { Logger } from 'winston';
import { ServerDBAnalysis } from './Analysis';
import { ServerDBEntry } from './Entry';
// import {DBCONTROLLER_APP,DBCONTROLLER_ENDPOINT,DBCONTROLLER_KEY,DBCONTROLLER_VERSION} from '../../config'
export class ServerDBController implements DBController {
	constructor() {
		/*
        Acá inicializar la db.
        En caso de requerir métodos asíncronos, asignar la referencia acá
         y crear un método asíncrono que la inicialice.
         No usar promesas dentro del constructor

         Cambiar el tipo unknown de la variable DB por el correspondiente
        */
		this.db = 'acá inicializar la db';
		this.$entry = new ServerDBEntry(this.db);
		this.$analysis = new ServerDBAnalysis(this.db);
	}
	private readonly db: unknown;
	private readonly logger = container.resolve<Logger>('logger');
	readonly $entry: DBEntry;
	readonly $analysis: DBAnalysis;
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
	async stats(): Promise<{ [key: string]: number }> {
		return {};
	}
	async insert(analysis: Analyzer.Analysis): Promise<void> {
		return;
	}
	async bulkDB(dbPath: string): Promise<DBController.bulkDBResult> {
		return { accepted: NaN, rejected: NaN };
	}
}
