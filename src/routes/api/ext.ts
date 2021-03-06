import { DBController } from 'ea-core-gpi-pi';
import { Router } from 'express';
import { container } from 'tsyringe';
import { GPIResponse } from '../../controllers/GPIResponse';
import { isApiAuth } from '../../middlewares/isApiAuth';

const route = Router();
export default async (app: Router): Promise<void> => {
	app.use('/ext', route);
	route.post('/bulk', isApiAuth, async (req, res) => {
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
};
