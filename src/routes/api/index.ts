import { Router } from 'express';
import { API_ENDPOINT, API_VERSION } from '../../config';
import extractors from './extractors';

export const apiRoute = async (): Promise<Router> => {
	const app = Router();
	app.use(API_ENDPOINT + API_VERSION, app);
	await extractors(app);
	return app;
};
