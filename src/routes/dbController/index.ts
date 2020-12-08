import { Router } from 'express';
import { DBCONTROLLER_ENDPOINT, DBCONTROLLER_VERSION } from '../../config';
import bulk from './bulk';
export const dbcontrollerRoute = async (): Promise<Router> => {
	const app = Router();
	app.use(DBCONTROLLER_ENDPOINT + DBCONTROLLER_VERSION, app);
	await bulk(app);
	return app;
};
