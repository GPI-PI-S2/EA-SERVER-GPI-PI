import { RequestHandler } from 'express';
import { API_KEY } from '../config';
import { GPIResponse } from '../controllers/GPIResponse';

export const isApiAuth: RequestHandler = async (req, res, next) => {
	const apiKey = req.headers['x-api-key'];
	const response = new GPIResponse(res);
	if (!apiKey) {
		res.set({
			'WWW-Authenticate': `Basic realm="Api"`,
		});
		return response.error('UNAUTHORIZED', 'No está autorizado a consumir este servicio');
	}
	if (apiKey !== API_KEY)
		return response.error(
			'FORBIDEN',
			'Las credenciales proporcionadas no permiten consumir este servicio',
		);
	return next();
};
