import { celebrate, Joi } from 'celebrate';
import { DBController } from 'ea-core-gpi-pi';
import { Router } from 'express';
import { container } from 'tsyringe';
import { GPIResponse } from '../../controllers/GPIResponse';
import { isApiAuth } from '../../middlewares/isApiAuth';

const route = Router();
export default async (app: Router): Promise<void> => {
	app.use('/stats', route);
	route.get('/extractors', isApiAuth, async (req, res) => {
		const DBController = container.resolve<DBController>('DBController');
		const response = new GPIResponse(res);
		try {
			await DBController.connect();
			const stats = await DBController.stats();
			await DBController.disconnect();
			return response.ok(stats);
		} catch (error) {
			if (error.isCustom) return response.errorFromCustom(error);
			return response.error('INTERNAL_ERROR', 'Problemas al obtener los stats', error);
		}
	});
	route.post(
		'/calc',
		isApiAuth,
		celebrate({
			body: Joi.object({
				extractor: Joi.string().max(250).optional(),
				metaKey: Joi.string().max(250).optional(),
			}).optional(),
		}),
		async (req, res) => {
			const response = new GPIResponse(res);
			const DBController = container.resolve<DBController>('DBController');
			try {
				let options: { metaKey?: string; extractor?: string } = req.body;
				if (!options) options = {};
				const { metaKey, extractor } = options;
				await DBController.connect();
				const result = await DBController.calc({ extractor, metaKey });
				return response.ok(result);
			} catch (error) {
				if (error.isCustom) return response.errorFromCustom(error);
				return response.error('INTERNAL_ERROR', 'Problemas al obtener los stats', error);
			}
		},
	);
};
