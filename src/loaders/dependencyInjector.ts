import { container } from 'tsyringe';
import { ServerDBController } from '../controllers/DBController';
import LoggerInstance from './logger';
export default (() => {
	container.register('logger', { useValue: LoggerInstance });
	container.register('DBController', { useValue: new ServerDBController() });
}) as () => void;
