import bodyParser from 'body-parser';
import { isCelebrateError } from 'celebrate';
import cors from 'cors';
import express from 'express';
import mysqlStore from 'express-mysql-session';
import session from 'express-session';
import { API_SECRET, DB_ADDRESS, DB_NAME, DB_PASS, DB_PORT, DB_USER } from '../config';
import { apiRoute } from '../routes';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MySQLStore = mysqlStore(session as any);
export default async ({ app }: { app: express.Application }): Promise<void> => {
	/**
	 * Health Check endpoints
	 * @TODO Explain why they are here
	 */
	app.get('/status', (req, res) => {
		res.status(200).end();
	});
	app.head('/status', (req, res) => {
		res.status(200).end();
	});

	// Enable Cross Origin Resource Sharing to all origins by default
	app.use(cors());

	// Middleware that transforms the raw string of req.body into json
	app.use(bodyParser.json());

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
			},
			rolling: true,
		}),
	);

	// Load API routes
	app.use(await apiRoute());

	/// catch 404 and forward to error handler
	app.use((req, res, next) => {
		const err = new Error('Not Found');
		res.status(404);
		next(err);
	});

	/// error handlers
	app.use((err, req, res, next) => {
		// Handle 401 thrown by express-jwt library
		if (err.name === 'UnauthorizedError') {
			return res.status(err.status).send({ data: err.message }).end();
		}

		// Handle 401 thrown by Celebrate
		if (isCelebrateError(err)) {
			let body = '';
			err.details.forEach((entry) => {
				const msg = entry.message;
				body += msg + ', ';
			});
			return res
				.status(400)
				.send({
					type: 'TYPE_ERROR',
					message: 'Erro de tipeo',
					data: { body: body.slice(0, -2) },
				})
				.end();
		}
		return next(err);
	});
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	app.use((err, req, res, next) => {
		res.status(err.status || 500);
		res.json({
			errors: {
				type: 'INTERNAL_ERROR',
				message: 'Erro desconocido',
				data: err,
			},
		});
	});
};
