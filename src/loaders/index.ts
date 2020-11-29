import { Express } from 'express';
import dependencyInjectorLoader from './dependencyInjector';
import expressLoader from './express';
import Logger from './logger';
export default async ({ app }: { app: Express }): Promise<void> => {
	dependencyInjectorLoader();
	await expressLoader({ app });
	Logger.info('✌️ Express loaded');
};
