import 'reflect-metadata';
import logger from '../src/loaders/logger';

async function main() {
	await (await import('./loaders')).default();
	await (await import(`./entries/db`)).default();
	return process.exit(0);
}
try {
	main();
} catch (error) {
	logger.error('CRITICAL ERROR', error);
	process.exit(1);
}
