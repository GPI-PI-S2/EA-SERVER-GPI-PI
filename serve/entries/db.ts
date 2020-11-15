import { container } from 'tsyringe';
import { ServerDBController } from '../../src/controllers/DBController';
/*
LOGS LEVELS de mayor a menor importancia
error: 0,
warn: 1,
info: 2,
http: 3,
verbose: 4,
debug: 5,
silly: 6

estructura de los logs:
logger.[TIPO]([MENSAJE],[OBJETO (opcional)])

ejemplos:

logger.info("mensaje");
logger.debug("mensaje",{var:123})
*/
import logger from '../../src/loaders/logger';
export default async () => {
	logger.info('Serve db started!');
	const DBController = container.resolve<ServerDBController>('DBController');
	await DBController.connect();
	const a = await DBController.calc('kkk');
	const sents = {
		Asertividad: 0.4,
		'Autoconciencia Emocional': 0,
		Autoestima: 0.1,
		'Colaboración y Cooperación': 0,
		'Comprensión Organizativa': 0.1,
		'Conciencia Crítica': 0,
		'Desarrollo de las relaciones': 0,
		Empatía: 0.6,
		Influencia: 0.3,
		Liderazgo: 0,
		'Manejo de conflictos': 0,
		'Motivación de logro': 0,
		'Percepción y comprensión Emocional': 0,
		Optimismo: 0,
		'Relación Social': 0,
		'Tolerancia a la frustración': 0,
		Violencia: 0.9,
		modelVersion: '',
	};

	await DBController.insert({
		extractor: 'Reddit',
		metaKey: 'kkk',
		modelVersion: 'v1',
		result: [{ input: { content: 'frase weona tres' }, sentiments: sents }],
	});
	logger.info('test', a);
};
