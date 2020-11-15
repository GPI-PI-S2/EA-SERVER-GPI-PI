import bodyParser from 'body-parser';
import { isCelebrateError } from 'celebrate';
import cors from 'cors';
import express from 'express';
import { API_ENDPOINT, API_VERSION } from '../config';
import routes from '../routes';

export default ({ app }: { app: express.Application }): void => {
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

	// Load API routes
	app.use(API_ENDPOINT + API_VERSION, routes());

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
			return res.status(err.status).send({ message: err.message }).end();
		}

		// Handle 401 thrown by Celebrate
		if (isCelebrateError(err)) {
			let message = '';
			err.details.forEach((entry) => {
				const msg = entry.message;
				message += ', ' + msg;
			});
			message = 'Request validation failed' + message;
			return res.status(400).send({ message }).end();
		}
		return next(err);
	});
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	app.use((err, req, res, next) => {
		res.status(err.status || 500);
		res.json({
			errors: {
				message: err.message,
			},
		});
	});
};
