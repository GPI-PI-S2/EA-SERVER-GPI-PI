import bodyParser from 'body-parser';
import { isCelebrateError } from 'celebrate';
import cors from 'cors';
import express from 'express';
import mysqlStore from 'express-mysql-session';
import session from 'express-session';
import {
    API_SECRET,
    DB_ADDRESS,
    DB_NAME,
    DB_PASS,
    DB_PORT,
    DB_USER,
    SITE_PUBLIC_DIR
} from '../config';
import { GPIResponse } from '../controllers/GPIResponse';
import { apiRoute, dbcontrollerRoute } from '../routes';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MySQLStore = mysqlStore(session as any);
export default async ({ app }: { app: express.Application }): Promise<void> => {
    
	/**
	 * Health Check endpoints
	 * @TODO Explain why they are here
	 */
	app.get('/status', (_req, res) => {
		res.status(200).end();
	});
	app.head('/status', (_req, res) => {
		res.status(200).end();
	});

	// Enable Cross Origin Resource Sharing to all origins by default
	app.use(cors(/* {credentials: true, origin: 'http://localhost:8080'} */));

	// Middleware that transforms the raw string of req.body into json
	app.use(bodyParser.json());

	// Public dir
	app.use(express.static('www'));
	app.use(express.static(SITE_PUBLIC_DIR));

	// Session
	app.use(
		session({
			secret: API_SECRET,
			store: new MySQLStore({
				host: DB_ADDRESS,
				port: DB_PORT,
				user: DB_USER,
				password: DB_PASS,
				database: DB_NAME,
			}),
			resave: true,
			saveUninitialized: true,
			cookie: {
                maxAge: 10 * 1000 * 60,
/*                 httpOnly: false,
                secure: false,
                sameSite:'none' */
			},
			rolling: true,
		}),
	);

	// Load API routes
	app.use(await apiRoute());
	// Load DB CONTROLLER routes
	app.use(await dbcontrollerRoute());

	/// catch 404 and forward to error handler
	app.use((req, res) => {
        console.log(req.url)
		const response = new GPIResponse(res);
		return response.error('NOT_FOUND', 'No encontrado');
	});
    
	/// error handlers
	app.use((err, _req, res, next) => {
		// Handle 401 thrown by express-jwt library
		const response = new GPIResponse(res);
		if (err.name === 'UnauthorizedError')
			return response.error('UNAUTHORIZED', 'No está autorizado a consumir este servicio');
		// Handle 401 thrown by Celebrate
		if (isCelebrateError(err)) {
			let body = '';
			err.details.forEach((entry) => {
				const msg = entry.message;
				body += msg + ', ';
			});
			return response.error('BAD_REQUEST', 'La petición es inválida', body.slice(0, -2));
		}
		return next(err);
	});
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	app.use((err, _req, res, _next) => {
		const response = new GPIResponse(res);
		if (err.isCustom) return response.errorFromCustom(err);
		else return response.error('INTERNAL_ERROR', 'Error interno del servidor', err.message);
	});
};
