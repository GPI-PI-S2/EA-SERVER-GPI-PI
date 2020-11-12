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
	DBController.$entry.create({content: 'asdasd'}, false);
	const a = await DBController.calc('test');
	logger.info('test', a);
};
