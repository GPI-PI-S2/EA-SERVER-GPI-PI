import { Router } from 'express';
import { API_ENDPOINT, API_VERSION } from '../../config';
import db from './db';
import extractors from './extractors';
import stats from './stats';

export const apiRoute = async (): Promise<Router> => {
	const app = Router();
	app.use(API_ENDPOINT + API_VERSION, app);
	await extractors(app);
	await stats(app);
	await db(app);
	return app;
};
