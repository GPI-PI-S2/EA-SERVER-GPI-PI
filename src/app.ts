import express from 'express';
import 'reflect-metadata'; // We need this in order to use @Decorators
import { ADDRESS, PORT, PROTOCOL } from './config';
import Logger from './loaders/logger';
async function main() {
	const app = express();
	(await import('./loaders')).default({ app });
	app.listen(PORT, () => {
		Logger.info(`
          ################################################
          🛡️  Server listening on: ${PROTOCOL}://${ADDRESS}:${PORT} 🛡️
          ################################################
        `);
	}).on('error', (err) => {
		Logger.error(err);
		process.exit(1);
	});
}
main();
