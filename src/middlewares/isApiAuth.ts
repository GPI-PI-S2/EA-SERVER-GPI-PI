import { RequestHandler } from 'express';
import { API_KEY } from '../config';

export const isAuth: RequestHandler = async (req, res, next) => {
	const apiKey = req.headers['x-api-key'];
	if (!apiKey) {
		return res
			.set({
				'WWW-Authenticate': `Basic realm="Api"`,
			})
			.sendStatus(401);
	}

	if (apiKey !== API_KEY) return res.sendStatus(403);
	return next();
};
