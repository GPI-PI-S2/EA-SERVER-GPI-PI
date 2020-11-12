import logger from '../../src/loaders/logger';
import dependencyInjectorLoader from './dependencyInjector';

export default async () => {
	await dependencyInjectorLoader();
	logger.verbose('✌️ Basic config loaded');
};
