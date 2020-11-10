import { container } from 'tsyringe';
import LoggerInstance from './logger';
export default (() => {
	container.register('logger', { useValue: LoggerInstance });
}) as () => void;
